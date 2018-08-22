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
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.*;

public class Notifications extends OpenDeskWebScript {

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
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = Utils.getJSONObject(contentParams, "PARAM_USERNAME");
            String method = Utils.getJSONObject(contentParams, "PARAM_METHOD");
            String nodeRefString = Utils.getJSONObject(contentParams, "PARAM_NODE_REF");

            NodeRef nodeRef = null;
            if (NodeRef.isNodeRef(nodeRefString))
                nodeRef = new NodeRef(nodeRefString);

            if (method != null) {
                switch (method) {
                    case "getAll":
                        arrayResult = this.getAllNotifications(userName);
                        break;

                    case "remove":
                        if (nodeRef != null && !nodeService.exists(nodeRef)) {
                            throw new AlfrescoRuntimeException("Sorry, nodeRef: " + nodeRef + " doesn't exist.");
                        } else {

                            arrayResult = this.removeNotification(nodeRef);
                        }
                        break;

                    case "setRead":
                        if (nodeRef != null)
                            arrayResult = this.setNotificationRead(nodeRef);
                        break;

                    case "setSeen":
                        if (nodeRef != null)
                            arrayResult = this.setNotificationSeen(nodeRef);
                        break;

                    case "setAllNotificationsSeen":
                        arrayResult = this.setAllNotificationsSeen(userName);
                        break;
                }
            }
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }

    /**
     * Gets all notifications.
     * (method = getAll)
     * This method also returns read notifications.
     * @param userName username of the user whose notifications are to be returned.
     * @return a JSONArray containing a JSONObject for each notification.
     */
    private JSONArray getAllNotifications(String userName) throws Exception {

        int unSeenSize = countUnSeenNotifications(userName);
        int unReadSize = countUnReadNotifications(userName);

        NodeRef user = personService.getPerson(userName);

        Set<QName> types = new HashSet<>();
        types.add(OpenDeskModel.TYPE_NOTIFICATION);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(user, types);
        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();

        JSONObject stats = new JSONObject();
        stats.put("unseen", unSeenSize);
        stats.put("unread", unReadSize);
        result.add(stats);

        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = notificationBean.getNotification(child.getChildRef());
            if(json != null)
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
