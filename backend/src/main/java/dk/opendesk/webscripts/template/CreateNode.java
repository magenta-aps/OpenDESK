package dk.opendesk.webscripts.template;

import dk.opendesk.repo.beans.TemplateBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class CreateNode extends OpenDeskWebScript {

    private TemplateBean templateBean;

    public void setTemplateBean(TemplateBean templateBean) {
        this.templateBean = templateBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String templateId = urlParams.get("templateId");
            String name = getContentString("name");
            String destinationNodeRef = getContentString("destinationNodeRef");
            templateBean.createNode(name, templateId, destinationNodeRef);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
