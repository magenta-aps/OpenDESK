package dk.opendesk.webscripts;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.*;

import java.io.IOException;
import java.io.Serializable;
import java.util.*;

public class Preferences extends AbstractWebScript {

    final Logger logger = LoggerFactory.getLogger(Preferences.class);

    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    private PreferenceService preferenceService;

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        JSONArray result = new JSONArray();
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

            String username = params.get("username");
            String pf = params.get("pf");

            Map<String, Serializable> preferences = preferenceService.getPreferences(username, pf);

            result = Utils.getJSONReturnArray(preferences);

        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        } finally {
            AuthenticationUtil.popAuthentication();
        }

        result.writeJSONString(webScriptResponse.getWriter());
    }
}
