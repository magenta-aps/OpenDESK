package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

public class GetGroupsTest extends OpenDeskWebScriptTest {

    public static final String BASE_URL = "/site/groups";

    public void testProjectGroups() throws Exception {
        JSONArray projectGroups = executeGetArray(BASE_URL + "/Project");

        JSONAssert.assertEquals(
                getJSONFromResources(JSON_RESOURCE_PATH + "/site/project_groups.json"),
                projectGroups,
                JSONCompareMode.STRICT
        );
    }
}
