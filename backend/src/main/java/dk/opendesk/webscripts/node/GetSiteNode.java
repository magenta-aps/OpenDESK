package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.repo.beans.SiteBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetSiteNode extends OpenDeskWebScript {

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
        super.execute(req, res);
        try {
            String siteShortName = urlParams.get("siteShortName");
            NodeRef nodeRef = siteBean.getDocumentLibraryRef(siteShortName);
            if(nodeRef != null)
                objectResult = nodeBean.getNodeInfo(nodeRef);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
