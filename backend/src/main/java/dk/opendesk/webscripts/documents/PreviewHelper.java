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
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.*;

public class PreviewHelper extends AbstractWebScript {

    private NodeService nodeService;
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());
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

    /**
     * Deletes a node.
     * (method = cleanUp)
     * @param nodeId id of the node.
     * @return JSONSuccess.
     */
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

    /**
     * Creates a thumbnail of a version
     * (method = createThumbnail)
     * @param parentNode parent node.
     * @param versionNode version node.
     * @return a JSONArray containing a JSONObject 'nodeRef'.
     */
    private JSONArray createThumbnail(String parentNode, String versionNode) {

        NodeRef parentRef = new NodeRef("workspace", "SpacesStore", parentNode);
        NodeRef versionRef = new NodeRef("versionStore", "version2Store", versionNode);

        Serializable parentName = nodeService.getProperty(parentRef, ContentModel.PROP_NAME);
        Serializable versionLabel = nodeService.getProperty(versionRef, ContentModel.PROP_VERSION_LABEL);
        String name =  "(v. " + versionLabel + ") " + parentName;

        NodeRef versionPreviewRef = nodeService.getChildByName(parentRef, OpenDeskModel.ASSOC_VERSION_PREVIEW, name);
        if(versionPreviewRef != null)
            return Utils.getJSONReturnPair("nodeRef", versionPreviewRef.toString());

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            // Add version previewable aspect if it is not present
            if(!nodeService.hasAspect(parentRef, OpenDeskModel.ASPECT_VERSION_PREVIEWABLE))
                nodeService.addAspect(parentRef, OpenDeskModel.ASPECT_VERSION_PREVIEWABLE, null);

            // Create new preview node of earlier version
            Map<QName, Serializable> properties = new HashMap<>();
            properties.put(ContentModel.PROP_NAME, name);
            Serializable content = nodeService.getProperty(versionRef, ContentModel.PROP_CONTENT);
            properties.put(ContentModel.PROP_CONTENT, content);
            ChildAssociationRef childAssocRef = nodeService.createNode(
                    parentRef,
                    OpenDeskModel.ASSOC_VERSION_PREVIEW,
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name),
                    ContentModel.TYPE_CONTENT,
                    properties);
            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);

            versionPreviewRef = childAssocRef.getChildRef();
        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONReturnPair("nodeRef", versionPreviewRef.toString());
    }
}