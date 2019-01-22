// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.beans;

import org.alfresco.repo.model.Repository;
import org.alfresco.repo.search.SearcherException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.List;

public class TemplateBean {
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

    /**
     * Creates a node from a template.
     * @param nodeName name of node.
     * @param templateNodeId id of template node.
     * @param destinationNodeRefStr nodeRef of destination.
     */
    public void createNode(String nodeName, String templateNodeId, String destinationNodeRefStr)
            throws FileNotFoundException {

        NodeRef templateNodeRef = new NodeRef(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, templateNodeId);
        NodeRef destinationNodeRef = new NodeRef(destinationNodeRefStr);
        boolean isContent = nodeBean.isContent(templateNodeRef);
        if(isContent) {
            // Add file extension to name
            nodeName += nodeBean.getFileExtension(templateNodeRef);
        }
        String fileName = nodeBean.getNextAvailableName(destinationNodeRef, nodeName, isContent);

        fileFolderService.copy(templateNodeRef, destinationNodeRef, fileName);
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
    public JSONArray getTemplates(List<String> path) throws SearcherException, JSONException, FileNotFoundException {

        NodeRef templateFolder = getTemplateFolderRef(path);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(templateFolder);

        JSONArray children = new JSONArray();
        for (ChildAssociationRef child : childAssociationRefs) {
            NodeRef templateRef = child.getChildRef();

            JSONObject json = nodeBean.getNodeType(templateRef);

            json.put("nodeRef", templateRef.getId());

            String name = nodeBean.getName(templateRef);
            json.put("name", name);

            boolean isFolder = "cmis:folder".equals(json.getString("contentType"));
            json.put("isFolder", isFolder);

            children.add(json);
        }

        return children;
    }
}
