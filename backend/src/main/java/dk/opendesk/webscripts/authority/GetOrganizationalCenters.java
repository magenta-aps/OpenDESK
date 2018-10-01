package dk.opendesk.webscripts.authority;

import dk.opendesk.repo.beans.AuthorityBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class GetOrganizationalCenters extends OpenDeskWebScript {

    private AuthorityBean authorityBean;

    public void setAuthorityBean(AuthorityBean authorityBean) {
        this.authorityBean = authorityBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String groupName = OpenDeskModel.ORGANIZATIONAL_CENTERS;
            objectResult = authorityBean.getOpenDeskGroup(groupName);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
