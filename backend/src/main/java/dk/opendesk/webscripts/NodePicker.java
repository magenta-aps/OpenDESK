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

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.List;
import java.util.Map;

public class NodePicker extends AbstractWebScript {

    private NodeService nodeService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

        Map<String, String> templateArgs = req.getServiceMatch().getTemplateVars();
        res.setContentEncoding("UTF-8");
        Writer webScriptWriter = res.getWriter();
        JSONArray result;

        try {
            String nodeId = templateArgs.get("nodeId");
            NodeRef nodeRef = new NodeRef("workspace://SpacesStore/" + nodeId);
            result = getChildNodes(nodeRef);
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            res.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    /**
     * Gets child nodes.
     * (method = getChildNodes)
     * @param nodeRef of the parent node.
     * @return a JSONArray containing JSONObjects for all child nodes.
     */
    private JSONArray getChildNodes(NodeRef nodeRef) throws JSONException {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();
        JSONObject json = new JSONObject();

        String nodeName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
        QName nodeType = nodeService.getType(nodeRef);
        NodeRef parentNodeRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
        QName parentNodeType = nodeService.getType(parentNodeRef);

        // Users should not be able to go further up the folder hierarchy than the Sites folder
        if (nodeType.equals(SiteModel.TYPE_SITES)) {
            parentNodeRef = null;
        }
        // Document Libraries should link to Sites directly as parent and have their name
        else if (parentNodeType.equals(SiteModel.TYPE_SITE)) {
            nodeName = (String) nodeService.getProperty(parentNodeRef, ContentModel.PROP_NAME);
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
        return result;
    }
}