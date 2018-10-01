package dk.opendesk.repo.beans;

import org.alfresco.service.cmr.discussion.DiscussionService;
import org.alfresco.service.cmr.discussion.PostInfo;
import org.alfresco.service.cmr.discussion.PostWithReplies;
import org.alfresco.service.cmr.discussion.TopicInfo;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.ArrayList;

public class DiscussionBean {

    private DiscussionService discussionService;
    private PersonBean personBean;

    public void setDiscussionService(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    public JSONObject getDiscussion(TopicInfo topic) throws JSONException {
        JSONObject result = new JSONObject();

        String title = topic.getTitle();
        result.put("title", title);

        long createdOn = topic.getCreatedAt().getTime();
        result.put("createdOn", createdOn);

        long modifiedOn = topic.getModifiedAt().getTime();
        result.put("modifiedOn", modifiedOn);
        PostInfo primaryPost = discussionService.getPrimaryPost(topic);
        PostWithReplies postWithReplies = discussionService.listPostReplies(primaryPost, 1);

        ArrayList<PostInfo> postInfos = new ArrayList<>();
        postInfos.add(primaryPost);
        for (PostWithReplies post: postWithReplies.getReplies()) {
            postInfos.add(post.getPost());
        }

        JSONArray posts = new JSONArray();
        for (PostInfo postInfo: postInfos) {
            JSONObject post = getPost(postInfo);
            if(post != null) {
                posts.add(post);
            }
        }
        result.put("posts", posts);

        return result;
    }

    public JSONObject getPost(PostInfo post) throws JSONException {
        if(post == null)
            return null;

        JSONObject result = new JSONObject();

        String creatorUserName = post.getCreator();
        JSONObject author = personBean.getPersonInfo(creatorUserName);
        result.put("author", author);

        String content = post.getContents();
        result.put("content", content);

        long createdOn = post.getCreatedAt().getTime();
        result.put("createdOn", createdOn);

        long modifiedOn = post.getModifiedAt().getTime();
        result.put("modifiedOn", modifiedOn);

        NodeRef nodeRef = post.getNodeRef();
        result.put("nodeRef", nodeRef);

        return result;
    }
}
