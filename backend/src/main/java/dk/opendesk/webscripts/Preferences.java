package dk.opendesk.webscripts;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class Preferences extends AbstractWebScript {

    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    private PreferenceService preferenceService;

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        JSONArray result;
        try {
            Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

            String username = AuthenticationUtil.getFullyAuthenticatedUser();
            String pf = params.get("pf");
            Map<String, Serializable> preferences = Utils.getPreferences(preferenceService, username, pf);
            result = Utils.getJSONReturnArray(preferences);

        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }

        result.writeJSONString(webScriptResponse.getWriter());

    }
}
