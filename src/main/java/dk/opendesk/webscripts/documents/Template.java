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
import org.alfresco.repo.search.SearcherException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.site.SiteService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Template extends AbstractWebScript {

    private FileFolderService fileFolderService;
    private NodeService nodeService;
    private SiteService siteService;

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String nodeName = Utils.getJSONObject(json, "PARAM_NODE_NAME");
            String templateNodeId = Utils.getJSONObject(json, "PARAM_TEMPLATE_NODE_ID");
            String destinationNodeRefStr = Utils.getJSONObject(json, "PARAM_DESTINATION_NODEREF");

            switch (method) {
                case "getAllTemplateDocuments":
                    result = getAllTemplateDocuments();
                    break;
                case "makeNewDocumentFromTemplate":
                    result = makeNewDocumentFromTemplate(nodeName, templateNodeId, destinationNodeRefStr);
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    private JSONArray getAllTemplateDocuments() throws SearcherException, JSONException {

        NodeRef documentLibrary = siteService.getContainer(OpenDeskModel.DOC_TEMPLATE, OpenDeskModel.DOC_LIBRARY);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(documentLibrary);

        JSONArray children = new JSONArray();
        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = new JSONObject();

            ContentData contentData = (ContentData) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CONTENT);
            String originalMimeType = contentData.getMimetype();

            Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());
            String name = (String) props.get(ContentModel.PROP_NAME);

            json.put("nodeRef", child.getChildRef().getId());
            json.put("name", name);
            json.put("mimeType", originalMimeType);

            children.add(json);
        }

        JSONArray response = new JSONArray();
        response.add(children);
        return response;
    }

    private JSONArray makeNewDocumentFromTemplate(String nodeName, String templateNodeId, String destinationNodeRefStr)
            throws JSONException, FileNotFoundException {

        NodeRef templateNodeRef = new NodeRef("workspace://SpacesStore/" + templateNodeId);
        NodeRef destinationNodeRef = new NodeRef(destinationNodeRefStr);
        String fileName = Utils.getFileName(nodeService, destinationNodeRef, nodeName);

        FileInfo newFile = fileFolderService.copy(templateNodeRef, destinationNodeRef, fileName);
        // TODO apparently a file is still created on FileExistsException with noderef as name. Should be deleted.

        Map<String, Serializable> response = new HashMap<>();
        response.put("nodeRef", newFile.getNodeRef());
        response.put("fileName", fileName);
        return Utils.getJSONReturnArray(response);
    }
}
