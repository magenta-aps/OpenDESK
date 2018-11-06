package dk.opendesk.webscripts.person;

import dk.opendesk.repo.beans.PersonBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class ValidatePerson extends OpenDeskWebScript {

    private PersonBean personBean;

    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = getContentString("userName");
            String email = getContentString("email");
            objectResult = personBean.validatePerson(userName, email);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
