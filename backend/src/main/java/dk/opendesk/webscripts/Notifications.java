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

import dk.opendesk.repo.beans.NotificationBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.*;

public class Notifications extends AbstractWebScript {

    private NodeService nodeService;
    private NotificationBean notificationBean;
    private PersonService personService;

    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
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
                        String preference = "dk.magenta.sites.receiveNotifications";
                        notificationBean.addNotification(userName, message, subject, link, type, project, preference);
                        break;

                    case "addReply":
                        String replyPreference = "dk.magenta.sites." + project + ".discussions." + nodeRefString + ".subscribe";
                        notificationBean.addNotification(userName, message, subject, link, type, project, replyPreference);
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

    /**
     * Gets all notifications.
     * (method = getAll)
     * This method also returns read notifications.
     * @param userName username of the user whose notifications are to be returned.
     * @return a JSONArray containing a JSONObject for each notification.
     */
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
            JSONObject json = notificationBean.getNotification(child.getChildRef());
            children.add(json);
        }

        result.add(children);

        return result;
    }

    /**
     * Removes a notification.
     * (method = remove)
     * @param nodeRef of the notification.
     * @return JSONSuccess.
     */
    private JSONArray removeNotification(NodeRef nodeRef) {
        nodeService.deleteNode(nodeRef);
        return Utils.getJSONSuccess();
    }

    /**
     * Sets a notification as read.
     * (method = setRead)
     * @param nodeRef of the notification.
     * @return JSONSuccess.
     */
    private JSONArray setNotificationRead (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_READ, true);
        return Utils.getJSONSuccess();
    }

    /**
     * Sets a notification as seen.
     * (method = setSeen)
     * @param nodeRef of the notification.
     * @return JSONSuccess.
     */
    private JSONArray setNotificationSeen (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef,OpenDeskModel.PROP_NOTIFICATION_SEEN, true);
        return Utils.getJSONSuccess();
    }

    /**
     * Sets all notifications of a user as seen.
     * (method = setAllNotificationsSeen)
     * @param userName username of the user whose notifications are requested.
     * @return JSONSuccess.
     */
    private JSONArray setAllNotificationsSeen (String userName) {

        NodeRef user = personService.getPerson(userName);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocsByPropertyValue(user, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);

        for (ChildAssociationRef child : childAssociationRefs) {

            NodeRef n = child.getChildRef();
            this.setNotificationSeen(n);
        }
        return Utils.getJSONSuccess();
    }

    /**
     * Gets the information of a notification.
     * (method = getInfo)
     * @param notification nodeRef of the notification.
     * @return a JSONObject representing the notification.
     */
    private JSONArray getInfo (NodeRef notification) throws JSONException {
        JSONArray result = new JSONArray();
        JSONObject json = notificationBean.getNotification(notification);
        result.add(json);
        return result;
    }

    /**
     * Counts number of child nodes of a user with a specific property value.
     * @param userName username of the user whose notifications are requested.
     * @param property to check.
     * @param value to check.
     * @return number of child nodes of a user with a specific property value.
     */
    private int countPropertyValue(String userName, QName property, Serializable value) {
        NodeRef user = personService.getPerson(userName);
        return nodeService.getChildAssocsByPropertyValue(user, property, value).size();
    }

    /**
     * Counts number of unseen notifications of a user.
     * @param userName username of the user whose notifications are requested.
     * @return number of unseen notifications of a user.
     */
    private int countUnSeenNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);
    }

    /**
     * Counts number of unread notifications of a user.
     * @param userName username of the user whose notifications are requested.
     * @return number of unread notifications of a user.
     */
    private int countUnReadNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_READ, false);
    }
}