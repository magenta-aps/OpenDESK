package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import javax.crypto.spec.OAEPParameterSpec;
import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;


public class GetSystemNode extends AbstractWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

        Map<String, String> templateArgs = req.getServiceMatch().getTemplateVars();
        res.setContentEncoding("UTF-8");
        Writer webScriptWriter = res.getWriter();
        JSONObject result = new JSONObject();

        try {
            String shortName = templateArgs.get("shortName");
            NodeRef nodeRef = null;
            switch (shortName) {
                case "my-docs":
                    nodeRef = nodeBean.getUserHome();
                    break;
                case "company-home":
                    nodeRef = nodeBean.getCompanyHome();
                    break;
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
            if(nodeRef != null)
                result = nodeBean.getNodeInfo(nodeRef);
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONErrorObj(e);
            res.setStatus(400);
        }
        Utils.writeJSONObject(webScriptWriter, result);
    }
}
