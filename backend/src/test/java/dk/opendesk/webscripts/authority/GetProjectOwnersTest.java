package dk.opendesk.webscripts.authority;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;

public class GetProjectOwnersTest extends OpenDeskWebScriptTest {

    public GetProjectOwnersTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        // USERS
        users.add(USER_TWO);
        users.add(USER_THREE);
        users.add(USER_FOUR);
    }

    public void testGetProjectOwnersGroupShortName() throws IOException, JSONException {
        JSONObject returnJSON = executeWebScript();
        String shortName = returnJSON.getString(SHORTNAME);
        assertEquals(OpenDeskModel.PROJECT_OWNERS, shortName);
    }

    public void testGet4MembersOfProjectOwners() throws IOException, JSONException {
        String organizationalCentersGroup = "GROUP_" + OpenDeskModel.PROJECT_OWNERS;
        addToAuthority(organizationalCentersGroup, USER_ONE);
        addToAuthority(organizationalCentersGroup, USER_THREE);
        addToAuthority(organizationalCentersGroup, USER_FOUR);
        JSONObject returnJSON = executeWebScript();
        JSONArray members = returnJSON.getJSONArray(MEMBERS);
        // Per default OpenDesk already contains one member of this group
        assertEquals(4, members.length());
    }

    private JSONObject executeWebScript () throws IOException, JSONException {
        String uri = "/authority/project-owners";
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(uri);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, ADMIN);
        return new JSONObject(response.getContentAsString());
    }
}
