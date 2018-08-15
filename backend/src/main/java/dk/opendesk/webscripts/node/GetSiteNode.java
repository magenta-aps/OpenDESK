package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.beans.SiteBean;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;


public class GetSiteNode extends AbstractWebScript {

    private NodeBean nodeBean;
    private SiteBean siteBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }
    public void setSiteBean(SiteBean siteBean) {
        this.siteBean = siteBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

        Map<String, String> templateArgs = req.getServiceMatch().getTemplateVars();
        res.setContentEncoding("UTF-8");
        Writer webScriptWriter = res.getWriter();
        JSONObject result = new JSONObject();

        try {
            String siteShortName = templateArgs.get("siteShortName");
            NodeRef nodeRef = siteBean.getDocumentLibraryRef(siteShortName);
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
