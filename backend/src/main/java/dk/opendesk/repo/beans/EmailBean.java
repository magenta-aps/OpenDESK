package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.executer.MailActionExecuter;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class EmailBean {
    private SearchBean searchBean;

    private ActionService actionService;
    private NodeService nodeService;
    private PersonService personService;
    private Properties properties;

    public void setSearchBean(SearchBean searchBean) {
        this.searchBean = searchBean;
    }

    public void setActionService (ActionService actionService) {
        this.actionService = actionService;
    }
    public void setNodeService(NodeService nodeService) { this.nodeService = nodeService; }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setProperties (Properties properties) {
        this.properties = properties;
    }

    public Serializable getEmailTemplateTitle(String templateFileName) {
        NodeRef template = queryEmailTemplate(templateFileName);
        if(template != null) {
            return nodeService.getProperty(template, ContentModel.PROP_TITLE);
        }
        return null;
    }

    private NodeRef queryEmailTemplate(String templateName) {
        String query = "PATH:\"" + OpenDeskModel.TEMPLATE_OD_FOLDER + "cm:" + templateName + "\"";
        return searchBean.queryNode(query);
    }

    public void sendEmail(String userName, String subject, String body) {
        if(!personService.personExists(userName))
            throw new UsernameNotFoundException("User " + userName + " not found.");

        NodeRef person = personService.getPerson(userName);
        Serializable to = nodeService.getProperty(person, ContentModel.PROP_EMAIL);
        String from = properties.getProperty("mail.from.default");
        sendEmail(subject, body, to, from);
    }

    /**
     * Sends an email to a user using a template.
     * @param subject of the email.
     * @param body of the email.
     * @param to the username of the user that the email is sent to.
     * @param from the username of the user that the email is sent from.
     */
    private void sendEmail(Serializable subject, String body, Serializable to, String from){
        Action mailAction = actionService.createAction(MailActionExecuter.NAME);
        mailAction.setParameterValue(MailActionExecuter.PARAM_SUBJECT, subject);
        mailAction.setParameterValue(MailActionExecuter.PARAM_TO, to);
        mailAction.setParameterValue(MailActionExecuter.PARAM_FROM, from);

        // Prepare and send email from template
        NodeRef template = queryEmailTemplate(OpenDeskModel.TEMPLATE_EMAIL_BASE);
        if(template != null) {
            mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE, template);
            Map<String, Object> model = new HashMap<>();
            model.put("body", body);
            model.put("subject", subject);
            mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE_MODEL, (Serializable) model);
            actionService.executeAction(mailAction, null);
        }
    }
}
