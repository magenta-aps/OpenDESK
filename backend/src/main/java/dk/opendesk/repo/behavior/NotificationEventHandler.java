// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
        // Check if node exists, might be moved, or created and deleted in same transaction.
        NodeRef nodeRef = parentChildAssocRef.getChildRef();
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                // If the topic is an empty topic then return as it is inside a review.
                TopicInfo topic = discussionService.getForNodeRef(nodeRef).getFirst();
                if(topic == null) return;
                notificationBean.notifyDiscussion(nodeRef, site);
            }
        }
    }

    public void onCreateContent(ChildAssociationRef parentChildAssocRef) throws JSONException {
        // Check if node exists, might be moved, or created and deleted in same transaction.
        NodeRef nodeRef = parentChildAssocRef.getChildRef();
        if (nodeRef != null && nodeService.exists(nodeRef)) {

            QName type = nodeService.getType(nodeRef);
            if(ContentModel.TYPE_THUMBNAIL.equals(type))
                return;
            if(OpenDeskModel.TYPE_NOTIFICATION.equals(type))
                return;
            if(OpenDeskModel.TYPE_REVIEW.equals(type))
                return;

            // If the node is contained by a site then notify members.
            SiteInfo site = siteService.getSite(nodeRef);
            if(site != null) {
                // Reply
                if(ForumModel.TYPE_POST.equals(type)) {

                    // If the post is added to an empty topic then return as it is inside a review.
                    NodeRef parentRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
                    TopicInfo topic = discussionService.getForNodeRef(parentRef).getFirst();
                    if(topic == null) return;
                    NodeRef topicRef = topic.getNodeRef();

                    // If the post is the primary post then return.
                    PostInfo primaryPost = discussionService.getPrimaryPost(topic);
                    NodeRef primaryPostRef = primaryPost.getNodeRef();
                    if(nodeRef.equals(primaryPostRef)) return;
                    notificationBean.notifyReply(nodeRef, primaryPostRef, topicRef, site);
                }
                // Content
                else {
                    // Do not send notifications when previews are made of versions.
                    QName qName = parentChildAssocRef.getTypeQName();
                    if(qName.equals(OpenDeskModel.ASSOC_VERSION_PREVIEW))
                        return;
                    notificationBean.notifySiteContent(nodeRef, site);
                }
            }
        }
    }
}
