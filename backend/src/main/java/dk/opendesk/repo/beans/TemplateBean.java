package dk.opendesk.repo.beans;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.search.SearcherException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.namespace.QName;
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
        // Add file extension to name
        nodeName += nodeBean.getFileExtension(templateNodeRef);
        String fileName = nodeBean.getNextAvailableName(destinationNodeRef, nodeName);

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
}
