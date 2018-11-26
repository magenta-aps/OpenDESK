package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetSiteTest extends OpenDeskWebScriptTest {

    public GetSiteTest() {
        super();
    }

    public void testGetSite()  throws IOException, JSONException {
        String siteShortName = SITE_ONE;
        String uri = "/site/" + siteShortName;
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(siteShortName, returnJSON.get(SHORTNAME));
    }
}
