package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.repo.utils.JSONUtils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.Map;

public class UpdateSettings extends AbstractWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) { this.settingsBean = settingsBean; }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        JSONObject result;

        try {
            JSONObject json = new JSONObject(c.getContent());

            JSONObject jsonProperties = JSONUtils.getObject(json, "properties");
            Map<QName, Serializable> properties = JSONUtils.getMap(jsonProperties);

            settingsBean.updateSettings(properties);
            result = JSONUtils.getSuccess();

        } catch (Exception e) {
            e.printStackTrace();
            result = JSONUtils.getError(e);
            webScriptResponse.setStatus(400);
        }

        JSONUtils.write(webScriptResponse.getWriter(), result);

    }
}