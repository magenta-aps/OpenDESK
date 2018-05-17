package dk.opendesk.repo.behavior;

import dk.opendesk.repo.beans.NotificationBean;
import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.model.ForumModel;
import org.alfresco.repo.node.NodeServicePolicies;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.discussion.DiscussionService;
import org.alfresco.service.cmr.discussion.PostInfo;
import org.alfresco.service.cmr.discussion.TopicInfo;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NotificationEventHandler {
    private static Logger logger = LoggerFactory.getLogger(NotificationEventHandler.class);

    // Dependencies
    private DiscussionService discussionService;
    private NotificationBean notificationBean;
    private NodeService nodeService;
    private PolicyComponent policyComponent;
    private SiteService siteService;

    public void setDiscussionService(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }
    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPolicyComponent(PolicyComponent policyComponent) {
        this.policyComponent = policyComponent;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    public void registerEventHandlers() {

        // Bind behaviours to node policies
        policyComponent.bindClassBehaviour(
                NodeServicePolicies.OnCreateNodePolicy.QNAME,
                OpenDeskModel.TYPE_REVIEW,
                new JavaBehaviour(this, "onCreateReview", NotificationFrequency.TRANSACTION_COMMIT)
        );

        policyComponent.bindClassBehaviour(
                NodeServicePolicies.OnCreateNodePolicy.QNAME,
                ForumModel.TYPE_TOPIC,
                new JavaBehaviour(this, "onCreateTopic", NotificationFrequency.TRANSACTION_COMMIT)
        );

        policyComponent.bindClassBehaviour(
                NodeServicePolicies.OnCreateNodePolicy.QNAME,
                ContentModel.TYPE_CONTENT,
                new JavaBehaviour(this, "onCreateContent", NotificationFrequency.TRANSACTION_COMMIT)
        );
    }

    public void onCreateReview(ChildAssociationRef parentChildAssocRef) throws JSONException {
        NodeRef nodeRef = parentChildAssocRef.getChildRef();
        // Check if node exists, might be moved, or created and deleted in same transaction.
        if (nodeRef != null && nodeService.exists(nodeRef)) {
            logger.debug("created Review with ref({})", nodeRef.getId());
            JSONObject params = new JSONObject();
            notificationBean.createNotification("admin", OpenDeskModel.NOTIFICATION_TYPE_REVIEW, params);
        }
    }

    public void onCreateTopic(ChildAssociationRef parentChildAssocRef) throws JSONException {
        NodeRef nodeRef = parentChildAssocRef.getChildRef();

        // Check if node exists, might be moved, or created and deleted in same transaction.
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                // If the topic is an empty topic then return as it is inside a review.
                TopicInfo topic = discussionService.getForNodeRef(nodeRef).getFirst();
                if(topic == null) return;

                logger.debug("created Discussion with ref({})", nodeRef.getId());
                JSONObject params = new JSONObject();
                notificationBean.createNotification("admin", OpenDeskModel.NOTIFICATION_TYPE_DISCUSSION, params);
            }
        }
    }

    public void onCreateContent(ChildAssociationRef parentChildAssocRef) throws JSONException {
        NodeRef nodeRef = parentChildAssocRef.getChildRef();

        // Check if node exists, might be moved, or created and deleted in same transaction.
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                QName type = nodeService.getType(nodeRef);
                // Reply
                if(ForumModel.TYPE_POST.equals(type)) {

                    // If the post is added to an empty topic then return as it is inside a review.
                    NodeRef parentRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
                    TopicInfo topic = discussionService.getForNodeRef(parentRef).getFirst();
                    if(topic == null) return;
                    // If the post is the primary post then return.
                    PostInfo primaryPost = discussionService.getPrimaryPost(topic);
                    if(nodeRef.equals(primaryPost.getNodeRef())) return;

                    logger.debug("created Reply with ref({})", nodeRef.getId());
                    JSONObject params = new JSONObject();
                    notificationBean.createNotification("admin", OpenDeskModel.NOTIFICATION_TYPE_REPLY, params);
                }
                // Content
                else {
                    logger.debug("created Content with ref({})", nodeRef.getId());
                    JSONObject params = new JSONObject();
                    notificationBean.createNotification("admin", OpenDeskModel.NOTIFICATION_TYPE_CONTENT, params);
                }
            }
            // TODO: notify users that the node is shared with.
            else {

            }
        }
    }
}