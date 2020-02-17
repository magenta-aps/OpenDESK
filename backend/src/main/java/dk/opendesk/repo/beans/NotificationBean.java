//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.search.impl.lucene.analysis.DateTimeAnalyser;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

public class NotificationBean {

    private static final String TRUNCATION_LIMIT_KEY = "openDesk.notifications.truncation.limit";
    private static final int DEFAULT_TRUNCATION_LIMIT = 15;

    private AuthorityService authorityService;
    private NodeService nodeService;
    private PersonService personService;
    private PreferenceService preferenceService;
    private SiteService siteService;
    private Properties globalProperties;

    private SettingsBean settingsBean;

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
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
    public void setGlobalProperties(Properties properties) { globalProperties = properties; }

    public void setSettingsBean(SettingsBean settingsBean) {
        this.settingsBean = settingsBean;
    }

    /**
     * Counts number of child nodes of a user with a specific property value.
     * @param userName username of the user whose notifications are requested.
     * @param property to check.
     * @param value to check.
     * @return number of child nodes of a user with a specific property value.
     */
    private int countPropertyValue(String userName, QName property, Serializable value) {
        NodeRef user = personService.getPerson(userName);
        return nodeService.getChildAssocsByPropertyValue(user, property, value).size();
    }

    /**
     * Counts number of unseen notifications of a user.
     * @param userName username of the user whose notifications are requested.
     * @return number of unseen notifications of a user.
     */
    private int countUnSeenNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_SEEN, false);
    }

    /**
     * Counts number of unread notifications of a user.
     * @param userName username of the user whose notifications are requested.
     * @return number of unread notifications of a user.
     */
    private int countUnReadNotifications(String userName) {
        return countPropertyValue(userName, OpenDeskModel.PROP_NOTIFICATION_READ, false);
    }

    /**
     * Creates a notification.
     * @param receiver username of the receiving user.
     * @param params of the notification.
     * @param preferenceFilter to check for of the receiving user.
     */
    private void createNotification(String receiver, JSONObject params, String preferenceFilter) {
        createNotification(receiver, params, preferenceFilter, false);
    }

    /**
     * Creates a notification
     * @param receiver username of the receiving user.
     * @param params of the notification.
     * @param preferenceFilter to check for of the receiving user.
     * @param requireSubscribe true if the user needs to explicitly subscribe to this kind of notification
     */
    private void createNotification(String receiver, JSONObject params, String preferenceFilter,
                                    boolean requireSubscribe) {
        // Important get current user before running as SystemUser
        String sender = AuthenticationUtil.getFullyAuthenticatedUser();

        // Don't send notifications to your self.
        if(receiver.equals(sender))
            return;

        // Then run as SystemUser
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

            // TODO: create TruncationStrategy and extract the code block below into its own TruncationStrategyImpl
            // in order to avoid responsibility erosion in this class. However, we will not worry about this now,
            // since the entire notification mechanism may be changed soon.

            // Truncate list of notifications

            String truncationLimitStr = globalProperties.getProperty(TRUNCATION_LIMIT_KEY);
            int truncationLimit = truncationLimitStr != null ? Integer.parseInt(truncationLimitStr) : DEFAULT_TRUNCATION_LIMIT;

            List<ChildAssociationRef> notifications = getNotifications(receiver);
            notifications.stream()
                    .map(ChildAssociationRef::getChildRef)
                    .sorted((NodeRef n1, NodeRef n2) -> {
                        Date d1 = (Date) nodeService.getProperty(n1, ContentModel.PROP_CREATED);
                        Date d2 = (Date) nodeService.getProperty(n2, ContentModel.PROP_CREATED);
                        return d1.compareTo(d2);
                    })
                    .limit(Math.max(0, notifications.size() - truncationLimit + 1))
                    .forEach(this::deleteNotification);

            // Don't send notification if the receiver turned off notifications for this event
            if (!preferenceFilter.isEmpty()) {
                Serializable preference = preferenceService.getPreference(receiver, preferenceFilter);
                // Don't send notification if the user did not explicitly subscribe for it
                if(requireSubscribe)
                {
                    if (!"true".equals(preference))
                        return;
                }
                else if ("false".equals(preference))
                    return;
            }

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
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    /**
     * Deletes a notification.
     * @param nodeRef of the notification.
     */
    public void deleteNotification(NodeRef nodeRef) {
        nodeService.deleteNode(nodeRef);
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

        String notificationId = notificationRef.getId();
        json.put("notificationId", notificationId);

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

    /**
     * Gets all notifications.
     * This method also returns read notifications.
     * @return a JSONObject containing metadata and a list of JSONObjects for each notification.
     */
    public JSONObject getNotifications() throws Exception {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        int unSeenSize = countUnSeenNotifications(userName);
        int unReadSize = countUnReadNotifications(userName);

        List<ChildAssociationRef> childAssociationRefs = getNotifications(userName);

        JSONObject result = new JSONObject();
        result.put("unseen", unSeenSize);
        result.put("unread", unReadSize);

        JSONArray children = new JSONArray();
        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = getNotification(child.getChildRef());
            if(json != null)
                children.add(json);
        }

        result.put("notifications", children);

        return result;
    }

    private List<ChildAssociationRef> getNotifications(String userName) {
        NodeRef user = personService.getPerson(userName);

        Set<QName> types = new HashSet<>();
        types.add(OpenDeskModel.TYPE_NOTIFICATION);

        return nodeService.getChildAssocs(user, types);
    }

    private JSONObject getSiteParams(String siteShortName) throws JSONException {
        String siteName = getSiteName(siteShortName);
        JSONObject params = new JSONObject();
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_SITE_SHORT_NAME, siteShortName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_SITE_MEMBER);
        return params;
    }

    public void notifyDiscussion(NodeRef nodeRef, SiteInfo site) throws JSONException {
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_SITE_SHORT_NAME, siteShortName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_DISCUSSION);
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".discussions.subscribe";

        // Send notifications to all members of this site
        Set<String> siteMembers = getSiteMembers(siteShortName);
        for(String userName : siteMembers)
            createNotification(userName, params, preferenceFilter);
    }

    public void notifyReply(NodeRef postRef, NodeRef primaryPostRef, NodeRef topicRef, SiteInfo site)
            throws JSONException {
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        Serializable postName = getNodeName(postRef);
        String topicId = topicRef.getId();
        Serializable primaryPostTitle = getNodeTitle(primaryPostRef);
        JSONObject params = new JSONObject();
        params.put(OpenDeskModel.PARAM_NODE_NAME, primaryPostTitle);
        params.put(OpenDeskModel.PARAM_NODE_ID, topicId);
        params.put(OpenDeskModel.PARAM_REPLY_SHORT_NAME, postName);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_SITE_SHORT_NAME, siteShortName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REPLY);
        String discussionId = topicRef.getId();
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".discussions." + discussionId + ".subscribe";

        // Send notifications to all members of this site
        Set<String> siteMembers = getSiteMembers(siteShortName);
        for(String userName : siteMembers)
            createNotification(userName, params, preferenceFilter, true);
    }

    public void notifyReview(NodeRef nodeRef, NodeRef reviewRef) throws JSONException {
        String userName = getReviewAssignee(reviewRef);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewApproved(NodeRef reviewRef) throws JSONException {
        String userName = getReviewSender(reviewRef);
        NodeRef nodeRef = nodeService.getPrimaryParent(reviewRef).getParentRef();
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW_APPROVED);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewRejected(NodeRef reviewRef) throws JSONException {
        String userName = getReviewSender(reviewRef);
        NodeRef nodeRef = nodeService.getPrimaryParent(reviewRef).getParentRef();
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_REVIEW_ID,  reviewRef.getId());
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_REVIEW_REJECTED);
        String preferenceFilter = "";
        createNotification(userName, params, preferenceFilter);
    }

    public void notifyReviewReply(NodeRef nodeRef, NodeRef reviewRef) throws JSONException {
        // Send notify to the other user connected to the review
        String currentUserName = AuthenticationUtil.getFullyAuthenticatedUser();
        String assignee = getReviewAssignee(reviewRef);
        String sender = getReviewSender(reviewRef);
        String userName;
        if(currentUserName.equals(assignee))
            userName = sender;
        else
            userName = assignee;

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

    public void notifySiteContent(NodeRef nodeRef, SiteInfo site) throws JSONException, FileNotFoundException {
        String siteShortName = site.getShortName();
        String siteName = getSiteName(siteShortName);
        JSONObject params = getNodeParams(nodeRef);
        params.put(OpenDeskModel.PARAM_SITE_NAME, siteName);
        params.put(OpenDeskModel.PARAM_TYPE,  OpenDeskModel.NOTIFICATION_TYPE_SITE_CONTENT);
        String preferenceFilter = "dk.magenta.sites." + siteShortName + ".documentLibrary.subscribe";
        boolean requireSubscribe = false;

        JSONObject settings = settingsBean.getSettings();
        if(settings.has("enableFavouriteSiteNotifications") && settings.getBoolean("enableFavouriteSiteNotifications")) {
            preferenceFilter = "org.alfresco.share.sites.favourites." + siteShortName;
            requireSubscribe = true;
        }

        // Send notifications to all members of this site
        Set<String> siteMembers = getSiteMembers(siteShortName);
        for(String userName : siteMembers)
            createNotification(userName, params, preferenceFilter, requireSubscribe);
    }

    public void notifySiteGroup(String authority, String siteShortName) throws JSONException {
        JSONObject params = getSiteParams(siteShortName);
        String preferenceFilter = "";

        // Send notifications to all members of this group
        Set<String> groupMembers = getAuthorityMembers(authority);
        for(String userName : groupMembers)
            createNotification(userName, params, preferenceFilter);
    }

    public void notifySiteMember(String userName, String siteShortName) throws JSONException {
        JSONObject params = getSiteParams(siteShortName);
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

    private String getNodeTitle(NodeRef nodeRef) {
        return (String) nodeService.getProperty(nodeRef, ContentModel.PROP_TITLE);
    }

    private String getReviewAssignee(NodeRef reviewRef) {
        return (String) nodeService.getProperty(reviewRef, OpenDeskModel.PROP_REVIEW_ASSIGNEE);
    }

    private String getReviewSender(NodeRef reviewRef) {
        return (String) nodeService.getProperty(reviewRef, ContentModel.PROP_CREATOR);
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

    private Set<String> getSiteMembers(String shortName) {
        String authority = "GROUP_site_" + shortName;
        return getAuthorityMembers(authority);
    }

    private Set<String> getAuthorityMembers(String authority) {
        return authorityService.getContainedAuthorities(AuthorityType.USER, authority, false);
    }

    /**
     * Sets a notification as read.
     * @param nodeRef of the notification.
     */
    public void setNotificationRead (NodeRef nodeRef) {
        // Then run as SystemUser
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
            nodeService.setProperty(nodeRef, OpenDeskModel.PROP_NOTIFICATION_READ, true);
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    /**
     * Sets a notification as seen.
     * @param nodeRef of the notification.
     */
    public void setNotificationSeen (NodeRef nodeRef) {
        // Then run as SystemUser
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
            nodeService.setProperty(nodeRef,OpenDeskModel.PROP_NOTIFICATION_SEEN, true);
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    /**
     * Sets all notifications of a user as seen.
     */
    public void setNotificationsSeen() {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        NodeRef user = personService.getPerson(userName);
        QName property = OpenDeskModel.PROP_NOTIFICATION_SEEN;
        List<ChildAssociationRef> childAssocRefs = nodeService.getChildAssocsByPropertyValue(user, property, false);
        for (ChildAssociationRef child : childAssocRefs) {
            NodeRef n = child.getChildRef();
            this.setNotificationSeen(n);
        }
    }
}



