package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

public class GetGroupsTest extends OpenDeskWebScriptTest {

    public static final String BASE_URL = "/site/groups";

    public void testProjectGroup() throws Exception {
        JSONArray projectGroups = executeGetArray(BASE_URL + "/Project");

        JSONAssert.assertEquals(
                getJSONFromResources(JSON_RESOURCE_PATH + "/site/project_groups.json"),
                projectGroups,
                JSONCompareMode.STRICT
        );
    }

    public void testPDprojectGroup() throws Exception {
        JSONArray projectGroups = executeGetArray(BASE_URL + "/PD-Project");

        JSONAssert.assertEquals(
                getJSONFromResources(JSON_RESOURCE_PATH + "/site/PD_project_groups.json"),
                projectGroups,
                JSONCompareMode.STRICT
        );
    }

    public void testUnknownGroup() throws Exception {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(BASE_URL + "/unknown");
        sendRequest(request, Status.STATUS_NOT_FOUND, ADMIN);
    }
}
