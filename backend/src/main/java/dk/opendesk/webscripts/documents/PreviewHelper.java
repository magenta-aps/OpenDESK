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
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class PreviewHelper extends OpenDeskWebScript {

    private NodeService nodeService;
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String parentNode = urlQueryParams.get("parent_node");
            String versionNode = urlQueryParams.get("version_node");
            String method = urlQueryParams.get("method");

            switch (method) {
                case "createThumbnail":
                    arrayResult = createThumbnail(parentNode, versionNode);
                    break;
            }
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
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
            QName cmName = QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name);
            ChildAssociationRef childAssocRef = nodeService.createNode(
                    parentRef,
                    OpenDeskModel.ASSOC_VERSION_PREVIEW,
                    cmName,
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
