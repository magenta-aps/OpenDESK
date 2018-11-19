package dk.opendesk.webscripts.authority;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static dk.opendesk.repo.model.OpenDeskModel.ORGANIZATIONAL_CENTERS;
import static dk.opendesk.repo.model.OpenDeskModel.PROJECT_OWNERS;

public class GetOpenDeskGroupsTest extends OpenDeskWebScriptTest {

    public GetOpenDeskGroupsTest() {
        super();
    }

    public void testGetOpenDeskGroups() throws IOException, JSONException {
        JSONArray returnJSON = executeWebScript();
        assertEquals(2, returnJSON.length());
    }

    public void testGetOpenDeskGroupsNames() throws IOException, JSONException {
        List<String> odGroups = new ArrayList<>();
        odGroups.add(PROJECT_OWNERS);
        odGroups.add(ORGANIZATIONAL_CENTERS);
        JSONArray returnJSON = executeWebScript();
        for (int i = 0; i < returnJSON.length(); i++) {
            assertTrue(odGroups.contains(returnJSON.getJSONObject(i).getString(SHORTNAME)));
        }
    }

    private JSONArray executeWebScript () throws IOException, JSONException {
        String uri = "/authority/openDeskGroups";
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(uri);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, ADMIN);
        return new JSONArray(response.getContentAsString());
    }
}
