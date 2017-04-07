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
import org.alfresco.model.ContentModel;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
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
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import dk.opendesk.repo.utils.Utils;

public class FileBrowser extends AbstractWebScript {

    private NodeService nodeService;
    private PersonService personService;
    private FileFolderService fileFolderService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;

    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
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

        if (method != null && method.equals("getAll")) {

            JSONArray result = this.getChildNodes(nodeRef);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

    private JSONArray getChildNodes(NodeRef nodeRef) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();
        JSONObject json = new JSONObject();

        try {
            String nodeName = (String)nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
            QName nodeType = nodeService.getType(nodeRef);
            NodeRef parentNodeRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
            QName parentNodeType = nodeService.getType(parentNodeRef);

            // Users should not be able to go further up the folder hierarchy than the Sites folder
            if (nodeType.equals(SiteModel.TYPE_SITES)) {
                parentNodeRef = null;
            }
            // Document Libraries should link to Sites directly as parent and have their name
            else if (parentNodeType.equals(SiteModel.TYPE_SITE)) {
                nodeName = (String)nodeService.getProperty(parentNodeRef, ContentModel.PROP_NAME);
                parentNodeRef = nodeService.getPrimaryParent(parentNodeRef).getParentRef();
            }

            if (parentNodeRef != null) {
                json.put("primaryParent_nodeRef", parentNodeRef);
                json.put("primaryParent_name", nodeName);
            }

            json.put("currentNodeRef_nodeRef", nodeRef.toString());
            json.put("currentNodeRef_name", nodeName);

            result.add(json);

            for (ChildAssociationRef child : childAssociationRefs) {
                JSONObject childJson = new JSONObject();

                NodeRef childRef = child.getChildRef();

                Map<QName, Serializable> props = nodeService.getProperties(childRef);
                String name = (String) props.get(ContentModel.PROP_NAME);
                QName childNodeType = nodeService.getType(childRef);

                // If the child is a site then link directly to its document library
                if (childNodeType.equals(SiteModel.TYPE_SITE)) {
                    childRef = nodeService.getChildByName(childRef, ContentModel.ASSOC_CONTAINS, SiteService.DOCUMENT_LIBRARY);
                    childNodeType = ContentModel.TYPE_FOLDER;
                }
                // If the child is not a site and the current node is Sites folder then it is not to be displayed
                else if (nodeType.equals(SiteModel.TYPE_SITES)) {
                    continue;
                }

                // Only folders will be displayed
                if (childNodeType.equals(ContentModel.TYPE_FOLDER)) {

                    childJson.put("nodeRef", childRef);
                    childJson.put("name", name);

                    children.add(childJson);
                }
            }

            result.add(children);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }
}