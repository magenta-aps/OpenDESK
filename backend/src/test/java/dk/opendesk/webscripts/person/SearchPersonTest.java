package dk.opendesk.webscripts.person;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONObject;

public class SearchPersonTest extends OpenDeskWebScriptTest {

    public static final String BASE_URL = "/person/search";
    public static final String FILTER_URL = BASE_URL + "?filter=";

    public void setUp() throws Exception {
        super.setUp();
        AuthenticationUtil.runAs(() -> {
            createUser(USER_TWO, "x", "y");
            createUser(USER_THREE, "z", "w");
            users.add(USER_TWO);
            users.add(USER_THREE);
            return null;
        }, ADMIN);
    }

    public void testFindAllUsers() throws Exception {
        JSONArray users = executeGetArray(BASE_URL, ADMIN);
        // User one, two, three, admin and guest
        assertEquals(5, users.length());
    }

    public void testFindUserByFirstName() throws Exception {
        JSONArray users = executeGetArray(FILTER_URL + "x");
        JSONObject user = (JSONObject) users.get(0);
        assertEquals(1, users.length());
        assertEquals(USER_TWO, user.get("userName"));
    }

    public void testFindUserByLastName() throws Exception {
        JSONArray users = executeGetArray(FILTER_URL + "y");
        JSONObject user = (JSONObject) users.get(0);
        assertEquals(1, users.length());
        assertEquals(USER_TWO, user.get("userName"));
    }

    public void testFindTwoUsersByFirstName() throws Exception {
        AuthenticationUtil.runAs(() -> {
            createUser(USER_FOUR, "x", "lastName");
            users.add(USER_FOUR);
            return null;
        }, ADMIN);

        JSONArray users = executeGetArray(FILTER_URL + "x");
        JSONObject user1 = (JSONObject) users.get(0);
        JSONObject user2 = (JSONObject) users.get(1);
        assertEquals(2, users.length());
        assertEquals(USER_FOUR, user2.get("userName"));
        assertEquals(USER_TWO, user1.get("userName"));
    }

}
