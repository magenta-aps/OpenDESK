package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;


public class StopShare extends AbstractWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
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
            String userName = templateArgs.get("userName");
            String permission = templateArgs.get("permission");
            nodeBean.stopSharingNode(nodeRef, userName, permission);
            result = Utils.getJSONSuccess();
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            res.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }
}
