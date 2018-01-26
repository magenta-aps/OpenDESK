package dk.opendesk.webscripts;

        import java.io.IOException;
        import java.io.Serializable;
        import java.util.ArrayList;
        import java.util.HashMap;
        import java.util.List;
        import java.util.Map;

        import org.alfresco.repo.security.authentication.AuthenticationUtil;
        import org.alfresco.repo.web.scripts.BaseWebScriptTest;
        import org.alfresco.service.cmr.preference.PreferenceService;
        import org.alfresco.service.cmr.security.MutableAuthenticationService;
        import org.alfresco.service.cmr.security.PersonService;
        import org.alfresco.service.transaction.TransactionService;
        import org.apache.log4j.Logger;
        import org.json.JSONArray;
        import org.json.JSONObject;
        import org.springframework.extensions.webscripts.TestWebScriptServer;
        import org.json.JSONException;
        import org.junit.Test;
        import org.springframework.extensions.webscripts.Status;

public class PreferencesTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(PreferencesTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("PersonService");
    private PreferenceService preferenceService = (PreferenceService) getServer().getApplicationContext().getBean("preferenceService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private List<String> users = new ArrayList<>();

    private static final String PREFERENCE = "dk.magenta.sites.receiveNotifications";
    private static final String PREFERENCE_VALUE = "true";

    public PreferencesTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // USERS
        users.add(TestUtils.USER_ONE);

        for (String userName : users) {
            TestUtils.createUser(transactionService, personService, authenticationService, userName);
        }

        HashMap<String, Serializable> preferences = new HashMap<>();
        preferences.put(PREFERENCE, PREFERENCE_VALUE);
        preferenceService.setPreferences(TestUtils.USER_ONE, preferences);
    }

    public void testGetPreferenceForReceivingNotificationsForUserOne() throws JSONException, IOException {
        log.debug("PreferencesTest.testPreferencesWebscript");
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("username", TestUtils.USER_ONE);
                put("pf", PREFERENCE);
            }
        };
        JSONObject returnJSON = executeWebScript(args);
        assertEquals(PREFERENCE_VALUE, returnJSON.getString(PREFERENCE));
    }

    private JSONObject executeWebScript (Map<String, String> args) throws IOException, JSONException {
            TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("preferences").setArgs(args);
            TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
            return new JSONArray(response.getContentAsString()).getJSONObject(0);
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        // Delete users
        for (String userName : users) {
            TestUtils.deletePerson(transactionService, personService, userName);
        }
    }
}