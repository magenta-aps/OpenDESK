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

public class NotificationEventHandler {
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

    public void onCreateTopic(ChildAssociationRef parentChildAssocRef) throws JSONException {
        String userName = "admin";
        NodeRef nodeRef = parentChildAssocRef.getChildRef();

        // Check if node exists, might be moved, or created and deleted in same transaction.
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                // If the topic is an empty topic then return as it is inside a review.
                TopicInfo topic = discussionService.getForNodeRef(nodeRef).getFirst();
                if(topic == null) return;
                notificationBean.notifyDiscussion(userName, nodeRef, site);

                /*
    angular.forEach(vm.groups, function (group) {
      angular.forEach(group[1], function (member) {
        if (member.userName !== postItem.author.username)
          notificationsService.add(
            member.userName,
            subject,
            message,
            link,
            'new-discussion',
            $stateParams.projekt).then(function (val) {
            $mdDialog.hide()
          })
      })
    })
                 */
            }
        }
    }

    public void onCreateContent(ChildAssociationRef parentChildAssocRef) throws JSONException {
        String userName = "admin";
        NodeRef nodeRef = parentChildAssocRef.getChildRef();

        // Check if node exists, might be moved, or created and deleted in same transaction.
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            QName type = nodeService.getType(nodeRef);
            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                // Reply
                if(ForumModel.TYPE_POST.equals(type)) {

                    // If the post is added to an empty topic then return as it is inside a review.
                    NodeRef parentRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
                    TopicInfo topic = discussionService.getForNodeRef(parentRef).getFirst();
                    if(topic == null) return;
                    // If the post is the primary post then return.
                    PostInfo primaryPost = discussionService.getPrimaryPost(topic);
                    if(nodeRef.equals(primaryPost.getNodeRef())) return;

                    notificationBean.notifyReply(userName, nodeRef, site, primaryPost);
                    /*

    angular.forEach(vm.groups, function (group) {
      angular.forEach(group[1], function (member) {
        if (member.userName !== postItem.author.username)
          notificationsService.addReplyNotice(
            member.userName,
            subject,
            message,
            link,
            'new-reply',
            $stateParams.projekt,
            nodeRef).then(function (val) {
            $mdDialog.hide()
          })
      })
    })
                     */
                }
                // Content
                else if(!OpenDeskModel.TYPE_REVIEW.equals(type)) {
                    notificationBean.notifySiteContent(userName, nodeRef, site);
                }
            }
            // Make sure that it is not a notification or review.
            // Notifications will result in endless loop as they create new notifications
            else {
                // Discussions can only be added under sites so this must be shared content
                if(!OpenDeskModel.TYPE_NOTIFICATION.equals(type) &&
                        !OpenDeskModel.TYPE_REVIEW.equals(type)) {
                    notificationBean.notifySharedNode(userName, nodeRef);
                }
            }
        }
    }
}