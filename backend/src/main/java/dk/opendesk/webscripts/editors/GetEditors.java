package dk.opendesk.webscripts.editors;

import dk.opendesk.repo.beans.EditorBean;
import dk.opendesk.repo.utils.Utils;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;


public class GetEditors extends AbstractWebScript {

    private EditorBean editorBean;

    public void setEditorBean(EditorBean editorBean) {
        this.editorBean = editorBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

        res.setContentEncoding("UTF-8");
        Writer webScriptWriter = res.getWriter();
        JSONArray result = new JSONArray();

        try {
            result.add(editorBean.getEditors());
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            res.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }
}
