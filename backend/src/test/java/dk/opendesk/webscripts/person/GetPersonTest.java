package dk.opendesk.webscripts.person;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

public class GetPersonTest extends OpenDeskWebScriptTest {

    public static final String BASE_URL = "/person/";

    public void testGetExistingPerson() throws Exception {
        JSONObject user = executeGetObject(BASE_URL + USER_ONE);
        assertEquals("firstName", user.getString("firstName"));
        assertEquals("lastName", user.getString("lastName"));
        assertEquals("firstName lastName", user.getString("displayName"));
        assertTrue(user.getBoolean("isEnabled"));
        assertEquals("12234861", user.getString("telephone"));
        assertEquals("assets/img/avatars/blank-profile-picture.png", user.getString("avatar"));
        assertFalse(user.getBoolean("isAdmin"));
        assertEquals(USER_ONE, user.getString("userName"));
        assertEquals("email@email.com", user.getString("email"));
        assertEquals(9, user.length());
    }

    public void testGetNonExistingPersonReturnsStatus404() throws Exception {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(BASE_URL + "unknown");
        sendRequest(request, Status.STATUS_NOT_FOUND, ADMIN);
    }

}
