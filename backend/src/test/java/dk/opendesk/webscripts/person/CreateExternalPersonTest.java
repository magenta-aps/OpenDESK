package dk.opendesk.webscripts.person;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class CreateExternalPersonTest extends OpenDeskWebScriptTest {

    private static final String USERNAME = "userName";

    public CreateExternalPersonTest() {
        super();
    }

    public void testCreateExternalUser() throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("firstName", USER_EXT_FIRSTNAME);
        data.put("lastName", USER_EXT_LASTNAME);
        data.put("userName", USER_EXT);
        data.put("email", USER_EXT_EMAIL);
        data.put("telephone", USER_EXT_TELEPHONE);
        data.put("siteShortName", SITE_ONE);
        data.put("groupName", USER_EXT_GROUP);
        String uri = "/person/external";
        JSONObject returnJSON = executePostObject(uri, data);
        assertTrue(returnJSON.has(USERNAME));
        assertEquals(USER_EXT, returnJSON.getString(USERNAME));
    }

    @Override
    protected void tearDownTest() {
        deletePerson(USER_EXT);
    }
}
