package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.utils.Utils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetUserHome extends OpenDeskWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            arrayResult = Utils.getJSONReturnPair("nodeRef", nodeBean.getUserHome().toString());
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
