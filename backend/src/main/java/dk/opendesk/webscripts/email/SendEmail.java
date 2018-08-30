package dk.opendesk.webscripts.email;

import dk.opendesk.repo.beans.EmailBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class SendEmail extends OpenDeskWebScript {

    private EmailBean emailBean;

    public void setEmailBean(EmailBean emailBean) {
        this.emailBean = emailBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = getContentParam("userName");
            String subject = getContentParam("subject");
            String body = getContentParam("body");
            emailBean.sendEmail(userName, subject, body);
            arrayResult = getJSONSuccess();
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
