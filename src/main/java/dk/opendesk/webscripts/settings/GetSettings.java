package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.repo.utils.JSONUtils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class GetSettings extends AbstractWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) { this.settingsBean = settingsBean; }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        JSONObject result;

        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            Map<QName, Serializable> settings = settingsBean.getSettings();
            result = JSONUtils.getObject(settings);
        } catch (Exception e) {
            e.printStackTrace();
            result = JSONUtils.getError(e);
            webScriptResponse.setStatus(400);
        }

        JSONUtils.write(webScriptResponse.getWriter(), result);

    }
}