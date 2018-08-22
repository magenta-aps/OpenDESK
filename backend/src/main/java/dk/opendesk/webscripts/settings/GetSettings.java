package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class GetSettings extends OpenDeskWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) { this.settingsBean = settingsBean; }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            AuthenticationUtil.runAs(() -> {
                objectResult = settingsBean.getSettings();
                return true;
            }, AuthenticationUtil.getSystemUserName());
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
