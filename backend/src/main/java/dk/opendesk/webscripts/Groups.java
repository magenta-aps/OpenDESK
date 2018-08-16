package dk.opendesk.webscripts;

import dk.opendesk.repo.beans.GroupBean;
import dk.opendesk.repo.utils.Utils;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;

public class Groups extends AbstractWebScript {

    private GroupBean groupBean;

    public void setGroupBean(GroupBean groupBean) {
        this.groupBean = groupBean;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            // Read all used parameters no matter what method is used.
            // Those parameters that are not sent are set to an empty string
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String groupName = Utils.getJSONObject(json, "PARAM_GROUP_NAME");

            if(method != null) {
                switch (method) {

                    case "getAuthorities":
                        result = groupBean.getAuthorities("GROUP_" + groupName);
                        break;

                    case "getUsers":
                        result = groupBean.getUsers("GROUP_" + groupName);
                        break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }
}
