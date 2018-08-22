package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.utils.Utils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.util.ArrayList;


public class PreProcessMove extends OpenDeskWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            ArrayList<String> nodeRefStrs = Utils.getJSONArray(contentParams, "nodeRefs");
            ArrayList<NodeRef> nodeRefs = new ArrayList<>();
            for (String nodeRefStr : nodeRefStrs)
                nodeRefs.add(new NodeRef(nodeRefStr));

            String destinationRefStr = Utils.getJSONObject(contentParams, "destinationRef");
            NodeRef destinationRef = new NodeRef(destinationRefStr);

            arrayResult = nodeBean.preProcessMove(nodeRefs, destinationRef);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
