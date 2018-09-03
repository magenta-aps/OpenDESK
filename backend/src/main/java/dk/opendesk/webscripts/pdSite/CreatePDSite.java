package dk.opendesk.webscripts.pdSite;

import dk.opendesk.repo.beans.PDSiteBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class CreatePDSite extends OpenDeskWebScript {

    private PDSiteBean pdSiteBean;

    public void setPDSiteBean(PDSiteBean pdSiteBean) {
        this.pdSiteBean = pdSiteBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String title = getContentString("title");
            String description = getContentString("description");
            String sbsys = getContentString("sbsys");
            String owner = getContentString("owner");
            String manager = getContentString("manager");
            String centerId = getContentString("centerId");
            String templateName = getContentString("templateName");
            String visibility = getContentString("visibility");
            objectResult = pdSiteBean.createPDSite(title, description, sbsys, centerId, owner, manager, visibility,
                    templateName);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
