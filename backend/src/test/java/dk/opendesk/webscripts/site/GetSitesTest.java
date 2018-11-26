package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

public class GetSitesTest extends OpenDeskWebScriptTest {

    public GetSitesTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        createPrivateSite(SITE_TWO);
    }

    public void testGetSites()  throws IOException, JSONException {
        String uri = "/sites";
        JSONArray returnJSON = executeGetArray(uri);
        // There are already 2 sites before creating these two
        assertEquals(0, returnJSON.length());

        // Add the user to the sites
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_TWO, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            return null;
        }, ADMIN);
        returnJSON = executeGetArray(uri);
        assertEquals(2, returnJSON.length());
    }

    @Override
    protected void tearDownTest() {
        deleteSite(SITE_TWO);
    }
}
