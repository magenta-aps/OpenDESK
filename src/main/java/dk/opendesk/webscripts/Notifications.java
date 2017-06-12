/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.*;
import org.springframework.extensions.webscripts.AbstractWebScript;

import java.io.*;
import java.util.*;

import dk.opendesk.repo.utils.Utils;

public class Notifications extends AbstractWebScript {

    private NodeService nodeService;
    private PersonService personService;
    private SiteService siteService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            String userName = Utils.getJSONObject(json, "PARAM_USERNAME");
            String project = Utils.getJSONObject(json, "PARAM_PROJECT");
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String subject = Utils.getJSONObject(json, "PARAM_SUBJECT");
            String message = Utils.getJSONObject(json, "PARAM_MESSAGE");
            String link = Utils.getJSONObject(json, "PARAM_LINK");
            String nodeRefString = Utils.getJSONObject(json, "PARAM_NODE_REF");
            String type = Utils.getJSONObject(json, "PARAM_TYPE");

            NodeRef nodeRef = null;
            if(NodeRef.isNodeRef(nodeRefString))
                nodeRef = new NodeRef(nodeRefString);

            if(method != null) {
                switch (method) {
                    case "getAll":
                        result = this.getAllNotifications(userName);
                        break;

                    case "getInfo":
                        if (nodeRef != null)
                            result = this.getInfo(nodeRef);
                        break;

                    case "add":
                        result = addNotification(userName, message, subject, link, type, project);
                        break;

                    case "remove":
                        if (nodeRef != null && !nodeService.exists(nodeRef)) {
                            throw new AlfrescoRuntimeException("Sorry, nodeRef: " + nodeRef + " doesn't exist.");
                        } else {

                            result = this.removeNotification(nodeRef);
                        }
                        break;

                    case "setRead":
                        if (nodeRef != null)
                            result = this.setNotificationRead(nodeRef);
                        break;

                    case "setSeen":
                        if (nodeRef != null)
                            result = this.setNotificationSeen(nodeRef);
                        break;

                    case "setAllNotificationsSeen":
                        result = this.setAllNotificationsSeen(userName);
                        break;
                }
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    // also returns read notifications
    private JSONArray getAllNotifications(String userName) throws JSONException {

        int unSeenSize = countUnSeenNotifications(userName);
        int unReadSize = countUnReadNotifications(userName);

        NodeRef user = personService.getPerson(userName);

        Set<QName> types = new HashSet<>();
        types.add(OpenDeskModel.PROP_NOTIFICATION);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(user, types);
        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();

        JSONObject stats = new JSONObject();
        stats.put("unseen", unSeenSize);
        stats.put("unread", unReadSize);
        result.add(stats);

        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = Utils.convertNotificationToJSON(nodeService, siteService, personService, child.getChildRef());
            children.add(json);
        }

        result.add(children);

        return result;
    }

    private JSONArray addNotification(String userName, String message, String subject, String link, String type, String project) {

        ChildAssociationRef childAssocRef = null;
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

        //TODO: mangler at overføre ændringer til modellen fra wf notifications - der er nye properties

        NodeRef user = personService.getPerson(userName);

        childAssocRef = this.nodeService.createNode(
                user,
                OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(userName)),
                OpenDeskModel.PROP_NOTIFICATION,
                null);

                Map<QName, Serializable> contentProps = new HashMap<>();
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SUBJECT, subject);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_MESSAGE, message);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SEEN, "false");
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_LINK, link);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_TYPE, type);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_PROJECT, project);

                nodeService.setProperties(childAssocRef.getChildRef(),contentProps);
                nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);
        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONReturnPair("nodeRef", childAssocRef.getChildRef().toString());
    }

    private JSONArray removeNotification(NodeRef nodeRef) {
        nodeService.deleteNode(nodeRef);
        return Utils.getJSONSuccess();
    }

    private JSONArray setNotificationRead (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_READ, true);
        return Utils.getJSONSuccess();
    }

    private JSONArray setNotificationSeen (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef,OpenDeskModel.PROP_NOTIFICATION_SEEN, true);
        return Utils.getJSONSuccess();
    }

    private JSONArray setAllNotificationsSeen (String userName) {

        NodeRef user = personService.getPerson(userName);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocsByPropertyValue(user, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);

        for (ChildAssociationRef child : childAssociationRefs) {

            NodeRef n = child.getChildRef();
            this.setNotificationSeen(n);
        }
        return Utils.getJSONSuccess();
    }

    private JSONArray getInfo (NodeRef notification) throws JSONException {
        JSONArray result = new JSONArray();
        JSONObject json = Utils.convertNotificationToJSON(nodeService, siteService, personService, notification);
        result.add(json);
        return result;
    }

    private int countPropertyValue(String userName, QName property, Serializable value) {
        NodeRef user = personService.getPerson(userName);
        return nodeService.getChildAssocsByPropertyValue(user, property, value).size();
    }

    private int countUnSeenNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);
    }
    private int countUnReadNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_READ, false);
    }
}