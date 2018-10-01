package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetSystemNode extends OpenDeskWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String shortName = urlParams.get("shortName");
            NodeRef nodeRef = null;
            switch (shortName) {
                case "my-docs":
                    nodeRef = nodeBean.getUserHome();
                    break;
                case "system-folders":
                    nodeRef = nodeBean.getCompanyHome();
                    break;
            }
            if (nodeRef != null)
                objectResult = nodeBean.getNodeInfo(nodeRef);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
