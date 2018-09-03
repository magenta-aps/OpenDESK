package dk.opendesk.webscripts.review;

import dk.opendesk.repo.beans.ReviewBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class UpdateReview extends OpenDeskWebScript {

    private ReviewBean reviewBean;

    public void setReviewBean(ReviewBean reviewBean) {
        this.reviewBean = reviewBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String nodeId = urlParams.get("nodeId");
            NodeRef nodeRef = new NodeRef("workspace://SpacesStore/" + nodeId);
            String assignee = getContentParam("assignee");
            String status = getContentParam("status");
            String reply = getContentParam("reply");
            reviewBean.updateReview(nodeRef, assignee, status, reply);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
