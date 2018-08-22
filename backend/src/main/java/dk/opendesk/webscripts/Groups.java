package dk.opendesk.webscripts;

import dk.opendesk.repo.beans.GroupBean;
import dk.opendesk.repo.utils.Utils;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class Groups extends OpenDeskWebScript {

    private GroupBean groupBean;

    public void setGroupBean(GroupBean groupBean) {
        this.groupBean = groupBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            // Read all used parameters no matter what method is used.
            // Those parameters that are not sent are set to an empty string
            String method = Utils.getJSONObject(contentParams, "PARAM_METHOD");
            String groupName = Utils.getJSONObject(contentParams, "PARAM_GROUP_NAME");

            if(method != null) {
                switch (method) {

                    case "getAuthorities":
                        arrayResult = groupBean.getAuthorities("GROUP_" + groupName);
                        break;

                    case "getUsers":
                        arrayResult = groupBean.getUsers("GROUP_" + groupName);
                        break;
                }
            }
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
