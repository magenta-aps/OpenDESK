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
package dk.opendesk.webscripts.documents;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionHistory;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.apache.james.mime4j.dom.datetime.DateTime;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;


public class PreviewHelper extends AbstractWebScript {


    private NodeService nodeService;
    private PersonService personService;
    private VersionService versionService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setVersionService(VersionService versionService) {
        this.versionService = versionService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {
        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        System.out.println("preview helper");


        String method = params.get("method");

        if (method.equals("cleanup")) {

            System.out.println("cleaning:");

            String temp_node = params.get("version_node");
            NodeRef node = new NodeRef("workspace", "SpacesStore", temp_node);



            AuthenticationUtil.pushAuthentication();
            try {
                AuthenticationUtil.setRunAsUserSystem();
                // ...code to be run as Admin...

                System.out.println("start cleaning" + new Date());
                System.out.println(node);

                try {
                    // sleep a while until the fiel has been loaded in the frontend
                    Thread.sleep(10000);
                    nodeService.deleteNode(node);
                    System.out.println("done cleaning" + new Date());

                } catch (InterruptedException e) {
                    e.printStackTrace();
                }


            } finally {
                AuthenticationUtil.popAuthentication();
            }





            JSONArray response = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result","success");
                response.add(json);
                response.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        else {
            String parent_node = params.get("parent_node");
            String version_node = params.get("version_node");


            NodeRef parentRef = null;
            NodeRef versionRef = null;


            parentRef = new NodeRef("workspace", "SpacesStore", parent_node);

            ChildAssociationRef childAssociationRef = nodeService.getPrimaryParent(parentRef);
            NodeRef folder = childAssociationRef.getParentRef();

            versionRef = new NodeRef("versionStore", "version2Store", version_node);


            NodeRef result = this.createThumbnail(folder, versionRef);

            JSONArray response = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("nodeRef",result);
                response.add(json);
                response.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }





    }

    private NodeRef createThumbnail(NodeRef parentRef, NodeRef versionRef) {

        ChildAssociationRef childAssocRef;

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            childAssocRef= nodeService.createNode(
                    parentRef,
                    ContentModel.ASSOC_CONTAINS,
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName("copyofthefly_of " + versionRef.toString())),
                    ContentModel.TYPE_CONTENT,
                    null);

            nodeService.setProperty(childAssocRef.getChildRef(), ContentModel.PROP_CONTENT, nodeService.getProperty(versionRef, ContentModel.PROP_CONTENT));
            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);



        } finally {
            AuthenticationUtil.popAuthentication();
        }

        return childAssocRef.getChildRef();



    }
}

//http://localhost:8080/alfresco/s/previewhelper?parent_node=&version_node=