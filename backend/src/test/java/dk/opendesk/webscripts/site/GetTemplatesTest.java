package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GetTemplatesTest extends OpenDeskWebScriptTest {

    private List<String> templateShortNames;

    public GetTemplatesTest() {
        super();
    }

    @Override
    protected void setUpTest() throws JSONException {
        templateShortNames = new ArrayList<>();
        for(int i = 0; i < 3; i++) {
            JSONObject siteTemplate1 = createSiteTemplate(SITE_ONE);
            String siteShortName = siteTemplate1.getString(SHORTNAME);
            templateShortNames.add(siteShortName);
        }
    }

    public void testGetTemplatesTest()  throws IOException, JSONException {
        String uri = "/site/templates";
        JSONArray jsonArray = executeGetArray(uri);
        assertEquals(3, jsonArray.length());
    }

    @Override
    protected void tearDownTest() {
        for(String templateShortName : templateShortNames)
            deleteSite(templateShortName);
    }
}
