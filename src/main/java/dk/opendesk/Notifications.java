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
import org.alfresco.repo.security.authentication.AuthenticationUtil;
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
import java.io.PrintWriter;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.*;

import dk.opendesk.repo.utils.Utils;

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

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        NodeRef nodeRef = null;
        String storeType = params.get("STORE_TYPE");
        String storeId = params.get("STORE_ID");
        String nodeId = params.get("NODE_ID");
        String creatorName = params.get("creator");

        String documentId = params.get("document");
        System.out.println("hvad er document: " + documentId);
        NodeRef documentNodeRef = null;

        if (storeType != null && storeId != null && nodeId != null) {
            nodeRef = new NodeRef(storeType, storeId, nodeId);
        }

        if (storeType != null && storeId != null && documentId != null) {
            documentNodeRef = new NodeRef(storeType, storeId, documentId);
        }

        String userName = params.get("userName");
        String method = params.get("method");
        String subject = params.get("subject");
        String message = params.get("message");
        String type = params.get("type");

        System.out.println(method);

        if (method != null && method.equals("getAll")) {

            JSONArray result = this.getNotifications(userName);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

        else if (method != null && method.equals("add")) {

//
//            System.out.println("type");
//            System.out.println(type);
//            System.out.println(type.contains("wf"));

            if (type != null && type.contains("wf")) {
//
//                System.out.println("creating wf notification");
//                System.out.println("documentNodeRef");
//                System.out.println(documentNodeRef);
                this.addWFNotification(userName, message, subject, creatorName, documentNodeRef, type);
            }
            else {
                this.addNotification(userName, message, subject);
            }
        }

        else if (method != null && method.equals("remove")) {

            if (! nodeService.exists(nodeRef)) {
                throw new AlfrescoRuntimeException("Sorry, " + nodeRef + " doesn't exist, sucker!");
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
            String type = (String)props.get(OpenDeskModel.PROP_NOTIFICATION_TYPE);
            String message = (String)props.get(OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
            Boolean read = (Boolean)props.get(OpenDeskModel.PROP_NOTIFICATION_READ);
            String creator = (String)props.get(OpenDeskModel.PROP_NOTIFICATION_CREATOR);
            NodeRef document = (NodeRef)props.get(OpenDeskModel.PROP_NOTIFICATION_DOCUMENT);



            String documentShortNodeRef = document.toString();
            documentShortNodeRef = documentShortNodeRef.split("/")[3];

            try {
                json.put("nodeRef",child.getChildRef());
                json.put("subject",subject);
                json.put("message",message);
                json.put("document",documentShortNodeRef);
                json.put("creator",creator);
                json.put("read",read);
                json.put("type",type);
                json.put("created",nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CREATED));

                result.add(json);

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    private Map<String, Object> addNotification(String userName, String message, String subject) {

        //TODO: mangler at overføre ændringer til modellen fra wf notifications - der er nye properties

        NodeRef user = personService.getPerson(userName);
//        System.out.println(user);

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
                contentProps.put(OpenDeskModel.PROP_NOTIFICATION_TYPE, "non-wf");

                nodeService.setProperties(childAssocRef.getChildRef(),contentProps);

                nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);

        return null;
    }

    private Map<String, Object> addWFNotification(String userName, String message, String subject, String creator, NodeRef document, String type) {

        NodeRef user = personService.getPerson(userName);
//        System.out.println(user);

        final ChildAssociationRef[] childAssocRef = new ChildAssociationRef[1];

        AuthenticationUtil.RunAsWork<Void> runAsWork = new AuthenticationUtil.RunAsWork<Void>() {
            @Override
            public Void doWork() throws Exception {
                try {

                      childAssocRef[0] = nodeService.createNode(
                            user,
                            OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                            QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(userName)),
                            OpenDeskModel.PROP_NOTIFICATION,
                            null);


//                    System.out.println(childAssocRef[0]);
//                    System.out.println(" creator" + creator);


                    Map<QName, Serializable> contentProps = new HashMap<QName, Serializable>();
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SUBJECT, subject);
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_MESSAGE, message);
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_DOCUMENT, document);
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_CREATOR, creator);
                    contentProps.put(OpenDeskModel.PROP_NOTIFICATION_TYPE, type);

                    nodeService.setProperties(childAssocRef[0].getChildRef(), contentProps);

                    nodeService.addAspect(childAssocRef[0].getChildRef(), ContentModel.ASPECT_HIDDEN, null);



                } catch (Throwable t) {
//                    LOGGER.severe("ERROR when removing permissions on " + nodeRef.toString());
//                    LOGGER.severe(t.getMessage() + " caused by: "+ t.getCause().getMessage());
//                    StringWriter stringWriter = new StringWriter();
//                    PrintWriter printWriter = new PrintWriter(stringWriter);
//                    t.printStackTrace(printWriter);
//                    LOGGER.severe(stringWriter.toString());
                    System.out.println(t.toString());
                }
                return null;
            }
        };
        AuthenticationUtil.runAs(runAsWork, AuthenticationUtil.getAdminUserName());

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

//http://178.62.194.129:8080/alfresco/service/notifications?method=setRead&NODE_ID=/f1115ab8-bf2f-408c-b5ee-72acfb14be4c&STORE_TYPE=workspace&STORE_ID=SpacesStore



