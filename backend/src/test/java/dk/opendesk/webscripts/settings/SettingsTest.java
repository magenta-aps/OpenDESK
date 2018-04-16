package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SettingsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(dk.opendesk.webscripts.PreferencesTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("PersonService");
    private NodeService nodeService = (NodeService) getServer().getApplicationContext().getBean("nodeService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private Repository repository = (Repository) getServer().getApplicationContext().getBean("repositoryHelper");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private List<String> users = new ArrayList<>();

    private static final String PUBLIC_SETTING = "appName";
    private static final String PUBLIC_SETTING_VALUE = "OpenDesk";
    private static final String PUBLIC_SETTING_NEW_VALUE = "Test OpenDesk";
    private static final String PRIVATE_SETTING = "enableProjects";
    private static final boolean PRIVATE_SETTING_VALUE = false;
    private static final boolean PRIVATE_SETTING_NEW_VALUE = true;

    public SettingsTest() {
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

        Map<QName, Serializable> properties = new HashMap<>();
        JSONObject settings = new JSONObject();
        settings.put(PRIVATE_SETTING, PRIVATE_SETTING_VALUE);
        JSONObject publicSettings = new JSONObject();
        publicSettings.put(PUBLIC_SETTING, PUBLIC_SETTING_VALUE);
        settings.put("public", publicSettings);
        properties.put(OpenDeskModel.PROP_SETTINGS, settings.toString());
        TestUtils.updateSettings(transactionService, repository, fileFolderService, nodeService, properties);
    }

    public void testGetPublicSettings() throws JSONException, IOException {
        log.debug("SettingsTest.testGetPublicSettings");
        JSONObject returnJSON = executeGetPublicSettings();
        assertEquals(PUBLIC_SETTING_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }

    private JSONObject executeGetPublicSettings () throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("/settings/public");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK);
        return new JSONObject(response.getContentAsString());
    }

    public void testGetSettings() throws JSONException, IOException {
        log.debug("SettingsTest.testGetSettings");
        JSONObject returnJSON = executeGetSettings();
        assertEquals(PRIVATE_SETTING_VALUE, returnJSON.getBoolean(PRIVATE_SETTING));
        assertEquals(PUBLIC_SETTING_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }

    private JSONObject executeGetSettings () throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("/settings");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.USER_ONE);
        return new JSONObject(response.getContentAsString());
    }

    public void testUpdateSettings() throws JSONException, IOException {
        log.debug("SettingsTest.executeUpdateSettings");
        JSONObject data = new JSONObject();
        JSONObject properties = new JSONObject();
        JSONObject settings = new JSONObject();
        settings.put(PRIVATE_SETTING, PRIVATE_SETTING_NEW_VALUE);
        JSONObject publicSettings = new JSONObject();
        publicSettings.put(PUBLIC_SETTING, PUBLIC_SETTING_NEW_VALUE);
        settings.put("public", publicSettings);
        properties.put("settings", settings);
        data.put("properties", properties);
        executeUpdateSettings(data);
        JSONObject returnJSON = executeGetSettings();
        assertEquals(PRIVATE_SETTING_NEW_VALUE, returnJSON.getBoolean(PRIVATE_SETTING));
        assertEquals(PUBLIC_SETTING_NEW_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }

    private JSONObject executeUpdateSettings (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PutRequest("/settings", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONObject(response.getContentAsString());
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