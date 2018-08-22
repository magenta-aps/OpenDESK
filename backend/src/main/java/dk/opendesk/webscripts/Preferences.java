package dk.opendesk.webscripts;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class Preferences extends OpenDeskWebScript {

    private PreferenceService preferenceService;

    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String username = AuthenticationUtil.getFullyAuthenticatedUser();
            String pf = urlQueryParams.get("pf");
            Map<String, Serializable> preferences = Utils.getPreferences(preferenceService, username, pf);
            arrayResult = getJSONReturnArray(preferences);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
