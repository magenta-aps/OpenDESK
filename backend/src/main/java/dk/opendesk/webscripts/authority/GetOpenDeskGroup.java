package dk.opendesk.webscripts.authority;

import dk.opendesk.repo.beans.AuthorityBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class GetOpenDeskGroup extends OpenDeskWebScript {

    private AuthorityBean authorityBean;

    public void setAuthorityBean(AuthorityBean authorityBean) {
        this.authorityBean = authorityBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String groupName = urlParams.get("groupName");
            objectResult = authorityBean.getOpenDeskGroup(groupName);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
