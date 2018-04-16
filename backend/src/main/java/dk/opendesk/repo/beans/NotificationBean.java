package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class NotificationBean {

    private NodeService nodeService;
    private PersonService personService;
    private PreferenceService preferenceService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    /**
     * Adds a notification to a user.
     * @param userName username of the receiving user.
     * @param message of the notification.
     * @param subject of the notification.
     * @param link from the notification.
     * @param type of the notification.
     * @param project linked to from the notification.
     */
    public void addNotification(String userName, String message, String subject, String link, String type,
                                     String project, String preferenceFilter) {
        ChildAssociationRef childAssocRef;
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            //TODO: mangler at overføre ændringer til modellen fra wf notifications - der er nye properties

            if(!preferenceFilter.isEmpty())
                if(!"true".equals(preferenceService.getPreference(userName, preferenceFilter)))
                    return;

            NodeRef user = personService.getPerson(userName);

            childAssocRef = this.nodeService.createNode(
                    user,
                    OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(userName)),
                    OpenDeskModel.PROP_NOTIFICATION,
                    null);

            Map<QName, Serializable> contentProps = new HashMap<>();
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SUBJECT, subject);
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_MESSAGE, message);
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SEEN, "false");
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_LINK, link);
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_TYPE, type);
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_PROJECT, project);

            nodeService.setProperties(childAssocRef.getChildRef(), contentProps);
            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }
}
