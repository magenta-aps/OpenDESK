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

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.util.*;

public class PreviewHelper extends AbstractWebScript {

    private NodeService nodeService;
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {
        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        webScriptResponse.setContentEncoding("UTF-8");
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            String parentNode = params.get("parent_node");
            String versionNode = params.get("version_node");
            String method = params.get("method");

            if (method == null)
                method = "createThumbnail";  //TODO: Add method name "createThumbnail".

            switch (method) {
                case "cleanUp":
                    result = cleanUp(versionNode); // TODO Use another variable than versionNode as versionNode in this case is a normal root content NodeRef
                    break;
                case "createThumbnail":
                    result = createThumbnail(parentNode, versionNode);
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    private JSONArray cleanUp(String nodeId) throws InterruptedException {
        NodeRef n = new NodeRef("workspace", "SpacesStore", nodeId);

        System.out.println("Deleting nodeRef: " + n + " [" + new Date() + "]");
        // sleep a while until the preview has been loaded in the frontend
        Thread.sleep(10000);

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...
            nodeService.deleteNode(n);
        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONSuccess();
    }

    private JSONArray createThumbnail(String parentNode, String versionNode) {

        NodeRef parentRef = new NodeRef("workspace", "SpacesStore", parentNode);
        NodeRef versionRef = new NodeRef("versionStore", "version2Store", versionNode);
        NodeRef thumbnailNodeRef;

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            ChildAssociationRef childAssocRef = nodeService.createNode(
                    parentRef,
                    ContentModel.ASSOC_CONTAINS,
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI,
                            QName.createValidLocalName("copyofthefly_of " + versionRef.toString())),
                    ContentModel.TYPE_CONTENT,
                    null);

            nodeService.setProperty(childAssocRef.getChildRef(), ContentModel.PROP_CONTENT,
                    nodeService.getProperty(versionRef, ContentModel.PROP_CONTENT));

            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);

            thumbnailNodeRef = childAssocRef.getChildRef();
        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONReturnPair("nodeRef", thumbnailNodeRef.toString());
    }
}