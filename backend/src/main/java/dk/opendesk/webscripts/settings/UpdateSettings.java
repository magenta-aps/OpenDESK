package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.repo.utils.JSONUtils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.namespace.QName;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class UpdateSettings extends OpenDeskWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) { this.settingsBean = settingsBean; }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            JSONObject jsonProperties = JSONUtils.getObject(contentParams, "properties");
            Map<QName, Serializable> properties = JSONUtils.getMap(jsonProperties);
            settingsBean.updateSettings(properties);
            objectResult = JSONUtils.getSuccess();
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
