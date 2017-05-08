package dk.opendesk.webscripts;

        import java.io.IOException;
        import java.io.Serializable;
        import java.util.HashMap;
        import java.util.Map;

        import org.alfresco.model.ContentModel;
        import org.alfresco.repo.security.authentication.AuthenticationUtil;
        import org.alfresco.repo.web.scripts.BaseWebScriptTest;
        import org.alfresco.service.cmr.preference.PreferenceService;
        import org.alfresco.service.cmr.repository.NodeRef;
        import org.alfresco.service.cmr.security.MutableAuthenticationService;
        import org.alfresco.service.cmr.security.PersonService;
        import org.alfresco.util.PropertyMap;
        import org.apache.log4j.Logger;
        import org.json.JSONArray;
        import org.springframework.extensions.webscripts.TestWebScriptServer;
        import org.json.JSONException;
        import org.junit.Test;
        import org.springframework.extensions.webscripts.Status;

public class PreferencesTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(PreferencesTest.class);

    private MutableAuthenticationService authenticationService;
    private PersonService personService;
    private PreferenceService preferenceService;

    private static final String USER_ONE = "RunAsOne";
    private static final String ADMIN_USER_NAME = "admin";
    private static final String WEBSCRIPT_URL = "/preferences";
    private static final String PREFERENCE = "dk.magenta.sites.receiveNotifications";

    public PreferencesTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
                "authenticationService");
        this.personService = (PersonService) getServer().getApplicationContext().getBean("PersonService");
        this.preferenceService = (PreferenceService) getServer().getApplicationContext().getBean("preferenceService");

        AuthenticationUtil.setRunAsUserSystem();

        // Create users
        createUser(USER_ONE);
        HashMap<String, Serializable> preferences = new HashMap<>();
        preferences.put(PREFERENCE, "true");
        preferenceService.setPreferences(USER_ONE, preferences);
    }

    private void createUser(String userName) {
        if (!this.authenticationService.authenticationExists(userName)) {
            this.authenticationService.createAuthentication(userName, "PWD".toCharArray());

            PropertyMap ppOne = new PropertyMap(4);
            ppOne.put(ContentModel.PROP_USERNAME, userName);
            ppOne.put(ContentModel.PROP_FIRSTNAME, "firstName");
            ppOne.put(ContentModel.PROP_LASTNAME, "lastName");
            ppOne.put(ContentModel.PROP_EMAIL, "email@email.com");
            ppOne.put(ContentModel.PROP_JOBTITLE, "jobTitle");

            this.personService.createPerson(ppOne);
        }
    }

    @Test
    public void testPreferencesWebscript() {
        log.debug("PreferencesTest.testPreferencesWebscript");
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("username", USER_ONE);
                put("pf", PREFERENCE);
            }
        };
        String expected = "true";
        try {
            TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(WEBSCRIPT_URL).setArgs(args);
            TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, ADMIN_USER_NAME);
            assertEquals(expected, new JSONArray(response.getContentAsString()).getJSONObject(0).getString(PREFERENCE));
        } catch (IOException ex) {
            log.warn("IOException", ex);
        } catch (JSONException ex) {
            log.warn("JSONException", ex);
        }
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
    }
}