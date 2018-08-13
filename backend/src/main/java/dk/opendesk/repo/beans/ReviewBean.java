package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.discussion.DiscussionService;
import org.alfresco.service.cmr.discussion.PostInfo;
import org.alfresco.service.cmr.discussion.TopicInfo;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class ReviewBean {
    private NotificationBean notificationBean;

    private DiscussionBean discussionBean;
    private DiscussionService discussionService;
    private NodeService nodeService;

    public void setDiscussionBean(DiscussionBean discussionBean) {
        this.discussionBean = discussionBean;
    }
    public void setDiscussionService(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }

    public JSONObject getReview(NodeRef nodeRef) throws JSONException {
        JSONObject result = new JSONObject();
        Map<QName, Serializable> properties = nodeService.getProperties(nodeRef);

        TopicInfo topic = discussionService.getTopic(nodeRef, OpenDeskModel.REVIEW_DISCUSSION);
        if(topic != null) {
            result = discussionBean.getDiscussion(topic);
        }

        if(properties.containsKey(ContentModel.PROP_CREATOR))
            result.put("sender", properties.get(ContentModel.PROP_CREATOR));

        if(properties.containsKey(OpenDeskModel.PROP_REVIEW_ASSIGNEE))
            result.put("assignee", properties.get(OpenDeskModel.PROP_REVIEW_ASSIGNEE));

        if(properties.containsKey(OpenDeskModel.PROP_REVIEW_STATUS))
            result.put("status", properties.get(OpenDeskModel.PROP_REVIEW_STATUS));

        return result;
    }

    public void createReview(NodeRef nodeRef, String assignee, String message) throws JSONException {

        // Add Reviewable Aspect if the node is of content type and does not have it yet
        if(!nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_REVIEWABLE))
            if(ContentModel.TYPE_CONTENT.equals(nodeService.getType(nodeRef)))
                nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_REVIEWABLE, new HashMap<>());

        // Create Review
        QName assoc = OpenDeskModel.ASSOC_REVIEWED;
        QName type = OpenDeskModel.TYPE_REVIEW;

        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(ContentModel.PROP_NAME, OpenDeskModel.REVIEW);
        properties.put(OpenDeskModel.PROP_REVIEW_ASSIGNEE, assignee);

        NodeRef reviewRef = nodeService.createNode(nodeRef, assoc, type, type, properties).getChildRef();

        TopicInfo topic = discussionService.createTopic(reviewRef, OpenDeskModel.REVIEW_DISCUSSION);
        nodeService.setProperty(topic.getNodeRef(), ContentModel.PROP_NAME, OpenDeskModel.REVIEW_DISCUSSION);
        discussionService.createPost(topic, message);
        notificationBean.notifyReview(nodeRef, reviewRef);
    }

    public void updateReview(NodeRef nodeRef, String assignee, String status, String reply) throws JSONException {
        Map<QName, Serializable> properties = nodeService.getProperties(nodeRef);
        // Create reply
        if(!reply.isEmpty()) {
            TopicInfo topic = discussionService.getTopic(nodeRef, OpenDeskModel.REVIEW_DISCUSSION);
            PostInfo primaryPost = discussionService.getPrimaryPost(topic);
            discussionService.createReply(primaryPost, reply);
        }
        // Change status
        if(!status.isEmpty()) {
            properties.put(OpenDeskModel.PROP_REVIEW_STATUS, status);
            if(status.equals(OpenDeskModel.REVIEW_STATUS_APPROVED))
                notificationBean.notifyReviewApproved(nodeRef);
            else if(status.equals(OpenDeskModel.REVIEW_STATUS_REJECTED))
                notificationBean.notifyReviewRejected(nodeRef);
        }
        // Only send reply notification when status was not changed.
        else if(!reply.isEmpty()) {
            NodeRef documentRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
            notificationBean.notifyReviewReply(documentRef, nodeRef);
        }

        // Change assignee
        if(!assignee.isEmpty())
            properties.put(OpenDeskModel.PROP_REVIEW_ASSIGNEE, assignee);

        nodeService.setProperties(nodeRef, properties);
    }
}
