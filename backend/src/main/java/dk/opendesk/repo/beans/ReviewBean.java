package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.query.PagingRequest;
import org.alfresco.service.cmr.discussion.DiscussionService;
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

    private DiscussionService discussionService;
    private NodeService nodeService;

    public void setDiscussionService(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public JSONObject getReview(NodeRef nodeRef) throws JSONException {
        JSONObject result = new JSONObject();
        Map<QName, Serializable> properties = nodeService.getProperties(nodeRef);

        if(properties.containsKey(ContentModel.PROP_CREATOR))
            result.put("reporter", properties.get(ContentModel.PROP_CREATOR));

        if(properties.containsKey(OpenDeskModel.PROP_REVIEW_ASSIGNEE))
            result.put("assignee", properties.get(OpenDeskModel.PROP_REVIEW_ASSIGNEE));

        if(properties.containsKey(OpenDeskModel.PROP_REVIEW_STATUS))
            result.put("status", properties.get(OpenDeskModel.PROP_REVIEW_STATUS));

        TopicInfo topic = discussionService.getTopic(nodeRef, OpenDeskModel.REVIEW_DISCUSSION);
        if(topic != null) {
            NodeRef discussionRef = topic.getNodeRef();
            result.put("discussionId", discussionRef.getId());
        }

        return result;
    }

    public void createReview(NodeRef nodeRef, String assignee, String message) {

        // Add Reviewable Aspect if the node is of content type and does not have it yet
        if(!nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_REVIEWABLE))
            if(ContentModel.TYPE_CONTENT.equals(nodeService.getType(nodeRef)))
                nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_REVIEWABLE, new HashMap<>());

        // Create Review
        QName assoc = OpenDeskModel.ASSOC_REVIEWED;
        QName type = OpenDeskModel.TYPE_REVIEW;

        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(ContentModel.PROP_NAME, assignee);
        properties.put(OpenDeskModel.PROP_REVIEW_ASSIGNEE, assignee);

        NodeRef reviewRef = nodeService.createNode(nodeRef, assoc, type, type, properties).getChildRef();

        TopicInfo topic = discussionService.createTopic(reviewRef, OpenDeskModel.REVIEW_DISCUSSION);
        nodeService.setProperty(topic.getNodeRef(), ContentModel.PROP_NAME, OpenDeskModel.REVIEW_DISCUSSION);
        discussionService.createPost(topic, message);

    }

    public void updateReview(NodeRef nodeRef, String assignee, String status) {

        Map<QName, Serializable> properties = new HashMap<>();
        if(!status.isEmpty())
            properties.put(OpenDeskModel.PROP_REVIEW_STATUS, status);
        if(!assignee.isEmpty())
            properties.put(OpenDeskModel.PROP_REVIEW_ASSIGNEE, assignee);
        nodeService.setProperties(nodeRef, properties);
    }
}
