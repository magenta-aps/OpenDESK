package dk.opendesk.webscripts.person;

import dk.opendesk.repo.beans.AuthorityBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class SearchPerson extends OpenDeskWebScript {

    private AuthorityBean authorityBean;

    public void setAuthorityBean(AuthorityBean authorityBean) {
        this.authorityBean = authorityBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String filter = urlQueryParams.get("filter");
            arrayResult = authorityBean.findUsers(filter);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
