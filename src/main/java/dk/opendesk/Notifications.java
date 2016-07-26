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
package dk.opendesk;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.*;
import org.springframework.extensions.webscripts.AbstractWebScript;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

import java.io.IOException;
import java.io.Serializable;
import java.util.*;

import dk.opendesk.repo.utils.Utils;

/**
 * A demonstration Java controller for the Hello World Web Script.
 *
 * @author martin.bergljung@alfresco.com
 * @since 2.1.0
 */
public class Notifications extends AbstractWebScript {


    private NodeService nodeService;
    private PersonService personService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }


    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {


        System.out.println("hello");


        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        NodeRef nodeRef = null;
        String storeType = params.get("STORE_TYPE");
        String storeId = params.get("STORE_ID");
        String nodeId = params.get("NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            nodeRef = new NodeRef(storeType, storeId, nodeId);
        }

        String userName = params.get("userName");
        String method = params.get("method");
        String subject = params.get("subject");
        String message = params.get("message");

        System.out.println(method);
        System.out.println(userName);


        if (method != null && method.equals("getAll")) {

            JSONArray result = this.getNotifications(userName);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

        else if (method != null && method.equals("add")) {
            this.addNotification(userName,message,subject);
        }

        else if (method != null && method.equals("remove")) {

            if (! nodeService.exists(nodeRef)) {
                throw new AlfrescoRuntimeException("Sorry, " + nodeRef + " doesn't exist");
            }
            else {

                this.removeNotification(nodeRef);
            }
        }

        else if (method != null && method.equals("setRead")) {

            if (storeType != null && storeId != null && nodeId != null) {
                nodeRef = new NodeRef(storeType, storeId, nodeId);
                this.setNotificationRead(nodeRef);
            }
        }
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

            String subject = (String)props.get(OpenDeskModel.PROP_NOTIFICATION_SUBJECT);
            String message = (String)props.get(OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
            Boolean read = (Boolean)props.get(OpenDeskModel.PROP_NOTIFICATION_READ);

            try {
                json.put("nodeRef",child.getChildRef());
                json.put("subject",subject);
                json.put("message",message);
                json.put("read",read);
                json.put("created",nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CREATED));

                result.add(json);

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
        return result;
    }

    private Map<String, Object> addNotification(String userName, String message, String subject) {

        NodeRef user = personService.getPerson(userName);
        System.out.println(user);

        ChildAssociationRef childAssocRef = this.nodeService.createNode(
                user,
                OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(userName)),
                OpenDeskModel.PROP_NOTIFICATION,
                null);

                Map<QName, Serializable> contentProps = new HashMap<QName, Serializable>();
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SUBJECT, subject);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_MESSAGE, message);
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");

                nodeService.setProperties(childAssocRef.getChildRef(),contentProps);

                nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);

        return null;
    }

    private void removeNotification(NodeRef nodeRef) {
        nodeService.deleteNode(nodeRef);
    }

    private void setNotificationRead (NodeRef nodeRef) {
        nodeService.setProperty(nodeRef,OpenDeskModel.PROP_NOTIFICATION_READ, true);
    }



}

// create
//http://localhost:8080/alfresco/service/notifications?userName=fhp&message=duerdum&subject=hilsen&method=add&NODE_ID=3570b61b-a861-4a75-8a27-7b16393027cd&STORE_TYPE=workspace&STORE_ID=SpacesStore


// setRead
//http://localhost:8080/alfresco/service/notifications?method=setRead&NODE_ID=76e15607-5519-4ad6-915c-1c07086535f2&STORE_TYPE=workspace&STORE_ID=SpacesStore