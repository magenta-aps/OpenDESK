package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetRoleTest extends OpenDeskWebScriptTest {

    private String siteShortName = SITE_ONE;
    private String uri = "/site/" + siteShortName + "/role";

    public GetRoleTest() {
        super();
    }

    public void testGetOutsiderRole()  throws IOException, JSONException {
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(OpenDeskModel.OUTSIDER, returnJSON.get(ROLE));
    }

    public void testGetConsumerRole()  throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(siteShortName, USER_ONE, OpenDeskModel.SITE_CONSUMER);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(OpenDeskModel.CONSUMER, returnJSON.get(ROLE));
    }

    public void testGetManagerRole()  throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(siteShortName, USER_ONE, OpenDeskModel.SITE_MANAGER);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(OpenDeskModel.MANAGER, returnJSON.get(ROLE));
    }
}
