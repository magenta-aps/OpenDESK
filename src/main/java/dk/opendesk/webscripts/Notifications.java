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
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
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

                    case "add":
                        result = addNotification(userName, message, subject, link, type, project);
                        break;

                    case "remove":
                        if (nodeRef != null && !nodeService.exists(nodeRef)) {
                            throw new AlfrescoRuntimeException("Sorry, " + nodeRef + " doesn't exist, sucker!");
                        } else {

                            this.removeNotification(nodeRef);
                        }
                        break;

                    case "setRead":
                        if(nodeRef != null)
                            this.setNotificationRead(nodeRef);
                        break;


                    case "setSeen":
                        if(nodeRef != null)
                            this.setNotificationSeen(nodeRef);
                        break;


                    case "getInfo":
                        if(nodeRef != null)
                            result =  this.getInfo(nodeRef);
                        break;


                    case "setAllNotificationsSeen":

                           this.setAllNotificationsSeen(userName);




                }
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    private JSONArray getNotifications(String userName) {

        NodeRef user = personService.getPerson(userName);

        Set<QName> types = new HashSet<>();
        types.add(OpenDeskModel.PROP_NOTIFICATION);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(user, types);
        JSONArray result = new JSONArray();

        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = new JSONObject();


            Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());


            Boolean read = (Boolean)props.get(OpenDeskModel.PROP_NOTIFICATION_READ);

            if (!read) {
                String subject = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_SUBJECT);
                String message = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
                String link = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_LINK);

                try {
                    json.put("nodeRef", child.getChildRef());
                    json.put("subject", subject);
                    json.put("message", message);
                    json.put("read", read);

                    Date d = (Date) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CREATED);
                    json.put("created", d.getTime());

                    if(link != null)
                        json.put("link", link);

                    result.add(json);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
        return result;
    }

    // also returns read notifications
    private JSONArray getAllNotifications(String userName) throws JSONException {

        int size = this.countUnSeenNotifications(userName);

        NodeRef user = personService.getPerson(userName);

        Set<QName> types = new HashSet<>();
        types.add(OpenDeskModel.PROP_NOTIFICATION);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(user, types);
        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();
        JSONObject unseen = new JSONObject();

        unseen.put("unseen", size);
        result.add(unseen);
        int i = 0;

        for (ChildAssociationRef child : childAssociationRefs) {
            i++;

            JSONObject json = new JSONObject();


            Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());

            String subject = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_SUBJECT);
            String message = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
            Boolean read = (Boolean)props.get(OpenDeskModel.PROP_NOTIFICATION_READ);
            Boolean seen = (Boolean)props.get(OpenDeskModel.PROP_NOTIFICATION_SEEN);
            String link = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_LINK);
            String type = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_TYPE);
            String project = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_PROJECT);

            // project contains the shortName, we want the display name
            if (project != null) {
                project = siteService.getSite(project).getTitle();
            }

            System.out.println("type: " + type);

            String name = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CREATOR);
            NodeRef from = personService.getPerson(name);

            String from_name = (String)nodeService.getProperty(from, ContentModel.PROP_FIRSTNAME)  + " " + (String)nodeService.getProperty(from, ContentModel.PROP_LASTNAME);
            String fileName = "";

            if (type.contains(OpenDeskModel.PD_NOTIFICATION_REVIEW_REQUEST) || (type.contains(OpenDeskModel.PD_NOTIFICATION_REVIEW_APPROVED)) ||
                    (type.contains(OpenDeskModel.PD_NOTIFICATION_REJECTED)) || type.contains(OpenDeskModel.PD_NOTIFICATION_NEWDOC)) {

                NodeRef document = new NodeRef("workspace://SpacesStore/" + link.replace("/#!/dokument/", "").split("\\?")[0]);
                link = link + "&NID=" + child.getChildRef(); // add this to the link, makes it easy to lookup the notification from the ui

                try {
                    fileName = (String) nodeService.getProperty(document, ContentModel.PROP_NAME);

                } catch (InvalidNodeRefException e) {

                    if (!type.contains(OpenDeskModel.PD_NOTIFICATION_PROJECT)) {
                        continue; // Skip this notification if the document is no longer available.
                    }
                }


            }
            else {
                fileName = "";
            }
            try {
                json.put("nodeRef", child.getChildRef());
                json.put("subject", subject);
                json.put("message", message);
                json.put("link", link);
                json.put("read", read);
                json.put("seen", seen);
                json.put("filename", fileName);
                json.put("project", project);
                json.put("from", from_name);
                json.put("type", type);


                Date d = (Date) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CREATED);
                json.put("created", d.getTime());
                children.add(json);

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }


        result.add(children);

        return result;
    }

    private JSONArray addNotification(String userName, String message, String subject, String link, String type, String project) {

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

        //TODO: mangler at overføre ændringer til modellen fra wf notifications - der er nye properties

        NodeRef user = personService.getPerson(userName);


        ChildAssociationRef childAssocRef = this.nodeService.createNode(
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
        return Utils.getJSONSuccess();
    }

    private void removeNotification(NodeRef nodeRef) {
        nodeService.deleteNode(nodeRef);
    }

    private void setNotificationRead (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_READ, true);
    }

    private void setNotificationSeen (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef,OpenDeskModel.PROP_NOTIFICATION_SEEN, true);
    }

    private void setAllNotificationsSeen (String userName) {


        NodeRef user = personService.getPerson(userName);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocsByPropertyValue(user, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);

        for (ChildAssociationRef child : childAssociationRefs) {


            NodeRef n = child.getChildRef();

            this.setNotificationSeen(n);
        }
    }

    private JSONArray getInfo (NodeRef nodeRef) {
        String comment = (String)nodeService.getProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
        String link = (String)nodeService.getProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_LINK);
        String project = (String)nodeService.getProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_PROJECT);


        NodeRef document = new NodeRef("workspace://SpacesStore/" + link.replace("/#!/dokument/", "").split("\\?")[0]);
        String fileName = (String)nodeService.getProperty(document, ContentModel.PROP_NAME);

        Map<String, Serializable> map = new HashMap<>();
        map.put("comment", comment);
        map.put("project", project);
        map.put("filename", fileName);

        return Utils.getJSONReturnArray(map);
    }


    private int countUnSeenNotifications(String userName) {

        NodeRef user = personService.getPerson(userName);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocsByPropertyValue(user, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);

        int count = 0;
        for (ChildAssociationRef child : childAssociationRefs) {
            count++;
        }

        return count;
    }
}

// create
//http://localhost:8080/alfresco/service/notifications?userName=fhp&message=duerdum&subject=hilsen&method=add&NODE_ID=3570b61b-a861-4a75-8a27-7b16393027cd&STORE_TYPE=workspace&STORE_ID=SpacesStore


// setRead
//http://localhost:8080/alfresco/service/notifications?method=setRead&NODE_ID=76e15607-5519-4ad6-915c-1c07086535f2&STORE_TYPE=workspace&STORE_ID=SpacesStore

//http://178.62.194.129:8080/alfresco/service/notifications?method=setRead&NODE_ID=/f1115ab8-bf2f-408c-b5ee-72acfb14be4c&STORE_TYPE=workspace&STORE_ID=SpacesStore



