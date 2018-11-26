package dk.opendesk.webscripts.pdSite;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class UpdatePDSiteTest extends OpenDeskWebScriptTest {

    public UpdatePDSiteTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        createPDSite(PD_SITE_ONE);
    }

    @Override
    protected void tearDownTest() {
        deleteSite(PD_SITE_ONE);
    }

    public void testUpdatePDSITE()  throws IOException, JSONException {
        String centerId = "C-PROD";
        JSONObject data = new JSONObject();
        data.put("title", PD_SITE_ONE);
        data.put("description", SITE_ONE_DESC);
        data.put("sbsys", "456");
        data.put("centerId", centerId);
        data.put("owner", USER_ONE);
        data.put("manager", ADMIN);
        data.put("visibility", "PUBLIC");
        data.put("state", "CLOSED");
        String uri = "/pd-site/" + PD_SITE_ONE;
        executePut(uri, data);

        AuthenticationUtil.runAs(() -> {
            String actualCenterId = (String) getProperty(PD_SITE_ONE, OpenDeskModel.PROP_PD_CENTERID);
            assertEquals(centerId, actualCenterId);
            return null;
        }, USER_ONE);
    }
}
