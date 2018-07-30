package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class NotificationBean {

    private NodeService nodeService;
    private PersonService personService;
    private PreferenceService preferenceService;
    private SiteService siteService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
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

            if(type.startsWith(OpenDeskModel.NOTIFICATION_TYPE_REVIEW))
                preferenceFilter = "";

            if(!preferenceFilter.isEmpty()) {
                Serializable preferenceValue = preferenceService.getPreference(userName, preferenceFilter);
                if ("false".equals(preferenceValue))
                    return;
            }

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

    public void createNotification(String userName, String type, JSONObject params) throws JSONException {

        // Check if user accepts notifications
        String preferenceFilter = "";
        switch (type) {
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW:
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW_APPROVED:
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW_REJECTED:
                break;
            case OpenDeskModel.NOTIFICATION_TYPE_REPLY:
                String site = params.getString("siteShortName");
                String nodeId = params.getString("nodeId");
                preferenceFilter = "dk.magenta.sites." + site + ".discussions." + nodeId + ".subscribe";
                break;
            default:
                preferenceFilter = "dk.magenta.sites.receiveNotifications";
                break;
        }

        if(!preferenceFilter.isEmpty())
            if(!"true".equals(preferenceService.getPreference(userName, preferenceFilter)))
                return;

        // Create notification
        NodeRef user = personService.getPerson(userName);
        ChildAssociationRef childAssocRef = this.nodeService.createNode(
                user,
                OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(userName)),
                OpenDeskModel.PROP_NOTIFICATION,
                null);

        String sender = AuthenticationUtil.getFullyAuthenticatedUser();
        params.put("sender", sender);

        Map<QName, Serializable> contentProps = new HashMap<>();
        contentProps.put(OpenDeskModel.PROP_NOTIFICATION_TYPE, type);
        contentProps.put(OpenDeskModel.PROP_NOTIFICATION_PARAMS, params.toString());
        contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");
        contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SEEN, "false");

        nodeService.setProperties(childAssocRef.getChildRef(), contentProps);
        nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);
    }

    public void createDiscussionNotification(String userName, String type, String nodeId) throws JSONException {
        JSONObject params = new JSONObject();
        params.put("nodeId", nodeId);
        createNotification(userName, type, params);
    }

    public void createSharedNodeNotification(String userName, String type, String nodeId) throws JSONException {
        JSONObject params = new JSONObject();
        params.put("nodeId", nodeId);
        createNotification(userName, type, params);
    }

    private String getSiteDisplayName(String shortName) {
        if (shortName != null) {
            SiteInfo site = siteService.getSite(shortName);
            if (site != null) {
                return siteService.getSite(shortName).getTitle();
            }
        }
        return null;
    }

    /**
     * Gets a notification into a standard structured JSONObject.
     * @param notificationRef of the notification.
     * @return a JSONObject representing the notification.
     */
    public JSONObject getNotification (NodeRef notificationRef) throws JSONException {
        JSONObject json = new JSONObject();

        Map<QName, Serializable> props = nodeService.getProperties(notificationRef);

        String type = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_TYPE);
        String paramsStr = props.get(OpenDeskModel.PROP_NOTIFICATION_PARAMS).toString();
        JSONObject params = (JSONObject) JSONObject.stringToValue(paramsStr);
        Boolean read = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_READ);
        Boolean seen = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_SEEN);
        String projectName = "";

        String fileName = "";
        String nodeId = null;

        switch (type) {
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW:
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW_APPROVED:
            case OpenDeskModel.NOTIFICATION_TYPE_REVIEW_REJECTED:
            case OpenDeskModel.NOTIFICATION_TYPE_CONTENT:
//                NodeRef document = new NodeRef("workspace://SpacesStore/" + link.replace("#!/dokument/", "").split("\\?")[0]);
//
//                String symbol = link.contains("?") ? "&" : "?";
//
//                link = link + symbol + "NID=" + nodeId; // add this to the link, makes it easy to lookup the notification from the ui
//
//                if(nodeService.exists(document))
//                    fileName = (String) nodeService.getProperty(document, ContentModel.PROP_NAME);
                break;
            case OpenDeskModel.NOTIFICATION_TYPE_SHARED_CONTENT:
                nodeId = (String) json.get("nodeId");
                break;
        }

        if(nodeId != null)
            json.put("nodeId", nodeId);

        json.put("read", read);
        json.put("seen", seen);
        json.put("filename", fileName);
        json.put("project", projectName);

        String creatorUserName = (String) nodeService.getProperty(notificationRef, ContentModel.PROP_CREATOR);
        NodeRef creator = personService.getPerson(creatorUserName);
        String firstName = (String) nodeService.getProperty(creator, ContentModel.PROP_FIRSTNAME);
        String lastName = (String) nodeService.getProperty(creator, ContentModel.PROP_LASTNAME);
        String sender = (firstName + " " + lastName).trim();
        json.put("sender", sender);

        json.put("type", type);

        Date d = (Date) nodeService.getProperty(notificationRef, ContentModel.PROP_CREATED);
        json.put("created", d.getTime());

        return json;
    }
}



