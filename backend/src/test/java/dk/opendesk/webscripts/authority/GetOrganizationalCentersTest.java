package dk.opendesk.webscripts.authority;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;

public class GetOrganizationalCentersTest extends OpenDeskWebScriptTest {

    public GetOrganizationalCentersTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        // USERS
        users.add(USER_TWO);
        users.add(USER_THREE);
        users.add(USER_FOUR);
    }

    public void testGetOrganizationalCentersGroupShortName() throws IOException, JSONException {
        JSONObject returnJSON = executeWebScript();
        String shortName = returnJSON.getString(SHORTNAME);
        assertEquals(OpenDeskModel.ORGANIZATIONAL_CENTERS, shortName);
    }

    public void testGet4MembersOfOrganizationalCenters() throws IOException, JSONException {
        String organizationalCentersGroup = "GROUP_" + OpenDeskModel.ORGANIZATIONAL_CENTERS;
        addToAuthority(organizationalCentersGroup, USER_ONE);
        addToAuthority(organizationalCentersGroup, USER_THREE);
        addToAuthority(organizationalCentersGroup, USER_FOUR);
        JSONObject returnJSON = executeWebScript();
        JSONArray members = returnJSON.getJSONArray(MEMBERS);
        // Per default OpenDesk already contains one member of this group
        assertEquals(4, members.length());
    }

    private JSONObject executeWebScript () throws IOException, JSONException {
        String uri = "/authority/organizational-centers";
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(uri);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, ADMIN);
        return new JSONObject(response.getContentAsString());
    }
}
