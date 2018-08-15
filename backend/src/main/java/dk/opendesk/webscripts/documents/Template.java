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

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.search.SearcherException;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
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

    private NodeBean nodeBean;

    private FileFolderService fileFolderService;
    private NodeService nodeService;
    private Repository repository;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setRepository(Repository repository)
    {
        this.repository = repository;
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

                case "getDocumentTemplates":
                    result = getTemplates(OpenDeskModel.PATH_NODE_TEMPLATES);
                    break;

                case "getFolderTemplates":
                    result = getTemplates(OpenDeskModel.PATH_SPACE_TEMPLATES);
                    break;

                case "createContentFromTemplate":
                    result = createContentFromTemplate(nodeName, templateNodeId, destinationNodeRefStr);
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
     * Gets the nodeRef for a template folder.
     * @param templateFolderPath path of the template folder.
     * @return nodeRef of the template folder.
     */
    private NodeRef getTemplateFolderRef(List<String> templateFolderPath) throws SearcherException, FileNotFoundException {
        NodeRef companyHome = repository.getCompanyHome();
        return fileFolderService.resolveNamePath(companyHome, templateFolderPath).getNodeRef();
    }

    /**
     * Gets templates from path.
     * (method = getDocumentTemplates)
     * (method = getFolderTemplates)
     * @param path of the templates.
     * @return a JSONArray containing nodeRef, name and mimeType of each template.
     */
    private JSONArray getTemplates(List<String> path) throws SearcherException, JSONException, FileNotFoundException {

        NodeRef templateFolder = getTemplateFolderRef(path);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(templateFolder);

        JSONArray children = new JSONArray();
        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = new JSONObject();

            NodeRef templateRef = child.getChildRef();
            String name = nodeBean.getName(templateRef);

            QName childNodeType = nodeService.getType(templateRef);

            json.put("nodeRef", templateRef.getId());
            json.put("name", name);
            json.put("isFolder", childNodeType.equals(ContentModel.TYPE_FOLDER));

            ContentData contentData = (ContentData) nodeService.getProperty(templateRef, ContentModel.PROP_CONTENT);
            if(contentData != null) {
                String originalMimeType = contentData.getMimetype();
                json.put("mimeType", originalMimeType);
            }

            children.add(json);
        }

        JSONArray response = new JSONArray();
        response.add(children);
        return response;
    }

    /**
     * Creates content from a template.
     * (method = createContentFromTemplate)
     * @param nodeName name of node.
     * @param templateNodeId id of template node.
     * @param destinationNodeRefStr nodeRef of destination.
     * @return a JSONArray containing nodeRef and filename of each template.
     */
    private JSONArray createContentFromTemplate(String nodeName, String templateNodeId, String destinationNodeRefStr)
            throws FileNotFoundException {

        NodeRef templateNodeRef = new NodeRef(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, templateNodeId);
        NodeRef destinationNodeRef = new NodeRef(destinationNodeRefStr);
        // Add file extension to name
        nodeName += nodeBean.getFileExtension(templateNodeRef);
        String fileName = Utils.getFileName(nodeService, destinationNodeRef, nodeName);

        FileInfo newFile = fileFolderService.copy(templateNodeRef, destinationNodeRef, fileName);
        // TODO apparently a file is still created on FileExistsException with noderef as name. Should be deleted.

        Map<String, Serializable> response = new HashMap<>();
        response.put("nodeRef", newFile.getNodeRef());
        response.put("fileName", fileName);
        return Utils.getJSONReturnArray(response);
    }
}
