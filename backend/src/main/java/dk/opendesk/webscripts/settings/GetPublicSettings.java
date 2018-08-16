package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.repo.utils.JSONUtils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class GetPublicSettings extends AbstractWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) {
        this.settingsBean = settingsBean;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        JSONObject result;

        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            result = settingsBean.getPublicSettings();
        } catch (Exception e) {
            e.printStackTrace();
            result = JSONUtils.getError(e);
            webScriptResponse.setStatus(400);
        }

        JSONUtils.write(webScriptResponse.getWriter(), result);

    }
}
