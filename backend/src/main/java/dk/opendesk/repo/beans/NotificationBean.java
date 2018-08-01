package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.discussion.PostInfo;
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
    }

    public void createNotification(String receiver, JSONObject params, String preferenceFilter) {
        // Important get current user before running as SystemUser
        String sender = AuthenticationUtil.getFullyAuthenticatedUser();
        // Then run as SystemUser
        AuthenticationUtil.runAs(() -> {
            // Don't send notification if the receiver turned off notifications for this event
            if (!preferenceFilter.isEmpty())
                if ("false".equals(preferenceService.getPreference(receiver, preferenceFilter)))
                    return false;

            // Create notification
            NodeRef receiverNodeRef = personService.getPerson(receiver);
            ChildAssociationRef childAssocRef = nodeService.createNode(
                    receiverNodeRef,
                    OpenDeskModel.PROP_NOTIFICATION_ASSOC,
                    QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(receiver)),
                    OpenDeskModel.TYPE_NOTIFICATION,
                    null);

            // Set sender in params
            params.put("sender", sender);

            // Set properties
            Map<QName, Serializable> contentProps = new HashMap<>();
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_PARAMS, params.toString());
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_READ, "false");
            contentProps.put(OpenDeskModel.PROP_NOTIFICATION_SEEN, "false");
            nodeService.setProperties(childAssocRef.getChildRef(), contentProps);

            // Add hidden aspect
            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);
            return true;
        }, AuthenticationUtil.getSystemUserName());
    }

    /**
     * Gets a notification into a standard structured JSONObject.
     * @param notificationRef of the notification.
     * @return a JSONObject representing the notification.
     */
    public JSONObject getNotification (NodeRef notificationRef) throws Exception {

        JSONObject json = new JSONObject();
        QName type = nodeService.getType(notificationRef);
        if(!type.equals(OpenDeskModel.TYPE_NOTIFICATION)) {
            throw new Exception("The node with ref " + notificationRef + " is not af notification.");
        }

        Map<QName, Serializable> props = nodeService.getProperties(notificationRef);
        String paramsProp = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_PARAMS);

        // Delete old type notification when trying to load
        if(paramsProp == null) {
            nodeService.deleteNode(notificationRef);
            return null;
        }

        JSONObject params = new JSONObject(paramsProp);
        Boolean read = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_READ);
        Boolean seen = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_SEEN);

        json.put("read", read);
        json.put("seen", seen);
        json.put("params", params);

        // Update sender with current user name
        String senderUserName = params.getString("sender");
        NodeRef senderNodeRef = personService.getPerson(senderUserName);
        String firstName = (String) nodeService.getProperty(senderNodeRef, ContentModel.PROP_FIRSTNAME);
        String lastName = (String) nodeService.getProperty(senderNodeRef, ContentModel.PROP_LASTNAME);
        String sender = (firstName + " " + lastName).trim();
        params.put("sender", sender);

        Date d = (Date) nodeService.getProperty(notificationRef, ContentModel.PROP_CREATED);
        json.put("created", d.getTime());

        return json;
    }

    public void notifyDiscussion(String userName, NodeRef nodeRef, SiteInfo site) throws JSONException {
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_SITE_SHORT_NAME, siteShortName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_DISCUSSION);
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".discussions.subscribe";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReply(String userName, NodeRef nodeRef, SiteInfo site, PostInfo primaryPost) throws JSONException {
        String nodeId = nodeRef.getId();
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        Serializable replyShortName = getNodeName(nodeRef);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REPLY_SHORT_NAME, replyShortName);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_SITE_SHORT_NAME, siteShortName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REPLY);
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".discussions." + nodeId + ".subscribe";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReview(String userName, NodeRef nodeRef, NodeRef reviewRef) throws JSONException {
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewApproved(String userName, NodeRef reviewRef) throws JSONException {
        NodeRef nodeRef = nodeService.getPrimaryParent(reviewRef).getParentRef();
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW_APPROVED);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewRejected(String userName, NodeRef reviewRef) throws JSONException {
        NodeRef nodeRef = nodeService.getPrimaryParent(reviewRef).getParentRef();
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW_REJECTED);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewReply(String userName, NodeRef nodeRef, NodeRef reviewRef) throws JSONException {
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW_REPLY);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifySharedNode(String userName, NodeRef nodeRef) throws JSONException {
        QName type = nodeService.getType(nodeRef);
        String notificationType;
        if(type.equals(ContentModel.TYPE_CONTENT))
            notificationType = OpenDeskModel.NOTIFICATION_TYPE_SHARED_CONTENT;
        else if(type.equals(ContentModel.TYPE_FOLDER))
            notificationType = OpenDeskModel.NOTIFICATION_TYPE_SHARED_FOLDER;
        else return;

        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_TYPE,  notificationType);
        String preferenceFilter = "dk.magenta.shared-docs.subscribe";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifySiteContent(String userName, NodeRef nodeRef, SiteInfo site) throws JSONException {
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_SITE_CONTENT);
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".documentLibrary.subscribe";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifySiteMember(String userName, String siteShortName) throws JSONException {
        String siteName = getSiteName(siteShortName);
        JSONObject params = new JSONObject();
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_SITE_MEMBER);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    private String getNodeName(NodeRef nodeRef) {
        return (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
    }

    private JSONObject getNodeParams(NodeRef nodeRef) throws JSONException {
        String nodeId = nodeRef.getId();
        Serializable documentName = getNodeName(nodeRef);
        JSONObject params = new JSONObject();
        params.put(OpenDeskModel.PARAM_NODE_NAME, documentName);
        params.put(OpenDeskModel.PARAM_NODE_ID, nodeId);
        return params;
    }

    private String getSiteName(String shortName) {
        if (shortName != null) {
            SiteInfo site = siteService.getSite(shortName);
            if (site != null) {
                return siteService.getSite(shortName).getTitle();
            }
        }
        return "";
    }
}



