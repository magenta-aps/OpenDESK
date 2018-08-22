package dk.opendesk.webscripts.editors;

import dk.opendesk.repo.beans.EditorBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetEditors extends OpenDeskWebScript {

    private EditorBean editorBean;

    public void setEditorBean(EditorBean editorBean) {
        this.editorBean = editorBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            arrayResult.add(editorBean.getEditors());
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
