package dk.opendesk.webscripts.review;

import dk.opendesk.repo.beans.ReviewBean;
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
            String assignee = getContentString("assignee");
            String message = getContentString("message");
            String nodeId = getContentString("nodeId");
            NodeRef nodeRef = new NodeRef("workspace://SpacesStore/" + nodeId);
            reviewBean.createReview(nodeRef, assignee, message);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
