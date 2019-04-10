package dk.opendesk.webscripts.person;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONObject;

public class ValidatePersonTest extends OpenDeskWebScriptTest {

    private JSONObject person;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        person = new JSONObject();
    }

    public void testUserNameAndEmailExist() throws Exception {
        person.put("userName", USER_ONE);
        person.put("email", "email@email.com");

        JSONObject response = executePostObject("/person/validate", person);

        assertEquals(3, response.length());
        assertFalse(response.getBoolean("isValid"));
        assertTrue(response.getBoolean("userNameExists"));
        assertTrue(response.getBoolean("emailExists"));
    }

    public void testUserNameExistAndDoesNotEmailExist() throws Exception {
        person.put("userName", USER_ONE);
        person.put("email", "abc@xyz.org");

        JSONObject response = executePostObject("/person/validate", person);

        assertEquals(3, response.length());
        assertFalse(response.getBoolean("isValid"));
        assertTrue(response.getBoolean("userNameExists"));
        assertFalse(response.getBoolean("emailExists"));
    }

    public void testUserNameDoesNotExistAndEmailExist() throws Exception {
        person.put("userName", "unknown");
        person.put("email", "email@email.com");

        JSONObject response = executePostObject("/person/validate", person);

        assertEquals(3, response.length());
        assertFalse(response.getBoolean("isValid"));
        assertFalse(response.getBoolean("userNameExists"));
        assertTrue(response.getBoolean("emailExists"));
    }

    public void testUserNameDoesNotExistAndDoesNotEmailExist() throws Exception {
        person.put("userName", "unknown");
        person.put("email", "abc@xyz.org");

        JSONObject response = executePostObject("/person/validate", person);

        assertEquals(3, response.length());
        assertTrue(response.getBoolean("isValid"));
        assertFalse(response.getBoolean("userNameExists"));
        assertFalse(response.getBoolean("emailExists"));
    }


}
