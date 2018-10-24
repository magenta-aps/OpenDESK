package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


public class GetTemplateFolders extends OpenDeskWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            List<String> folderTypes = new ArrayList<>();
            folderTypes.add("document-templates");
            folderTypes.add("folder-templates");
            folderTypes.add("text-templates");
            for(String folderType : folderTypes) {
                NodeRef nodeRef = null;
                switch (folderType) {
                    case "document-templates":
                        nodeRef = nodeBean.getNodeByPath(OpenDeskModel.PATH_NODE_TEMPLATES);
                        break;
                    case "folder-templates":
                        nodeRef = nodeBean.getNodeByPath(OpenDeskModel.PATH_SPACE_TEMPLATES);
                        break;
                    case "text-templates":
                        nodeRef = nodeBean.getNodeByPath(OpenDeskModel.PATH_TEXT_TEMPLATES);
                        break;
                }
                if(nodeRef != null) {
                    String nodeId = nodeRef.getId();
                    objectResult.put(folderType, nodeId);
                }
            }
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
