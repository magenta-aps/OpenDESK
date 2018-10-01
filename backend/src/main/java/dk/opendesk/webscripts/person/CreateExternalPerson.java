package dk.opendesk.webscripts.person;

import dk.opendesk.repo.beans.EmailBean;
import dk.opendesk.repo.beans.PersonBean;
import dk.opendesk.repo.beans.SiteBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class CreateExternalPerson extends OpenDeskWebScript {

    private EmailBean emailBean;
    private PersonBean personBean;
    private SiteBean siteBean;

    public void setEmailBean(EmailBean emailBean) {
        this.emailBean = emailBean;
    }
    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }
    public void setSiteBean(SiteBean siteBean) {
        this.siteBean = siteBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String firstName = getContentString("firstName");
            String lastName = getContentString("lastName");
            String userName = getContentString("userName");
            String email = getContentString("email");
            String telephone = getContentString("telephone");
            String siteShortName = getContentString("siteShortName");
            String groupName = getContentString("groupName");
            Map<QName, Serializable> props = personBean.createPersonProperties(userName, firstName, lastName, email,
                    telephone);
            objectResult = createExternalPerson(props, siteShortName, groupName);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }

    /**
     * Creates an external person.
     * The new person is sent an invitation email to its email address.
     * @param props of the person.
     * @param siteShortName short name of the site that the person is added.
     * @param groupName name of the site group that the person is added to.
     * @return a JSONObject containing the rendered email template and email subject.
     */
    private JSONObject createExternalPerson(Map<QName, Serializable> props, String siteShortName, String groupName) {
        JSONObject json = new JSONObject();
        AuthenticationUtil.runAs(() -> {
            String userName = (String) props.get(ContentModel.PROP_USERNAME);
            // Create new external user and set password
            String password = personBean.createPerson(props);

            // Add external person to site group
            siteBean.addMember(siteShortName, userName, groupName);

            // Set username
            json.put("userName", userName);

            // Email File Name
            String emailFileName = OpenDeskModel.TEMPLATE_EMAIL_INVITE_EXTERNAL_USER;

            // Set subject
            Serializable subject = emailBean.getEmailTemplateTitle(emailFileName);
            if(subject != null)
                json.put("subject", subject);

            // Set body
            Map<String, Object> model = personBean.getInviteExternalUserModel(props, siteShortName, groupName, password);
            String body = fillEmailTemplate(emailFileName, model);
            json.put("body", body);
            return true;
        }, AuthenticationUtil.getSystemUserName());
        return json;
    }
}
