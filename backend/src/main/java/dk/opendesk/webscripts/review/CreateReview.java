package dk.opendesk.webscripts.review;

import dk.opendesk.repo.beans.ReviewBean;
import dk.opendesk.repo.utils.Utils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class CreateReview extends OpenDeskWebScript {

    private ReviewBean reviewBean;

    public void setReviewBean(ReviewBean reviewBean) {
        this.reviewBean = reviewBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String assignee = Utils.getJSONObject(contentParams, "assignee");
            String message = Utils.getJSONObject(contentParams, "message");
            String nodeId = Utils.getJSONObject(contentParams, "nodeId");
            NodeRef nodeRef = new NodeRef("workspace://SpacesStore/" + nodeId);
            reviewBean.createReview(nodeRef, assignee, message);
            arrayResult = Utils.getJSONSuccess();
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
