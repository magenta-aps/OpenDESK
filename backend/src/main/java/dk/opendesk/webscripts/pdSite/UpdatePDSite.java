package dk.opendesk.webscripts.pdSite;

import dk.opendesk.repo.beans.PDSiteBean;
import dk.opendesk.repo.utils.Utils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class UpdatePDSite extends OpenDeskWebScript {

    private PDSiteBean pdSiteBean;

    public void setPDSiteBean(PDSiteBean pdSiteBean) {
        this.pdSiteBean = pdSiteBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String siteShortName = urlParams.get("siteShortName");
            String title = getContentString("title");
            String description = getContentString("description");
            String sbsys = getContentString("sbsys");
            String owner = getContentString("owner");
            String manager = getContentString("manager");
            String state = getContentString("state");
            String centerId = getContentString("centerId");
            String visibilityStr = getContentString("visibility");
            SiteVisibility visibility = Utils.getVisibility(visibilityStr);
            pdSiteBean.updatePDSite(siteShortName, title, description, sbsys, centerId, owner, manager, state,
                    visibility);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
