package dk.opendesk.webscripts;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;

public class NotificationsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(NotificationsTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");

    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private static final String UNSEEN = "unseen";
    private static final String UNREAD = "unread";
    private static final String NODE_REF = "nodeRef";

    public NotificationsTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setRunAsUserSystem();

        // Create users
        TestUtils.deletePerson(transactionService, personService, TestUtils.USER_ONE);
        TestUtils.createUser(transactionService, personService, authenticationService, TestUtils.USER_ONE);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_ONE);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_TWO);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_THREE);
    }

    public void testUserHasNoUnseenNotifications() throws IOException, JSONException {
        log.debug("NotificationsTest.testUserHasNoUnseenNotifications");

        assertUnseen(TestUtils.USER_ONE, "0");
    }

    public void testCreateThreeNotificationsForUserOne() throws IOException, JSONException {
        log.debug("NotificationsTest.testCreateThreeNotificationsForUserOne");

        //Adds three notifications
        assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
        assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_TWO);
        assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_THREE);

        assertGetAll(TestUtils.USER_ONE, 3);
    }

    public void testRemoveNotification() throws JSONException, IOException {
        log.debug("NotificationsTest.testRemoveNotification");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);

        assertGetAll(TestUtils.USER_ONE, 1);

        assertRemove(nodeRef);

        assertGetAll(TestUtils.USER_ONE, 0);
    }

    public void testSetReadNotification() throws IOException, JSONException {
        log.debug("NotificationsTest.testSetReadNotification");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);
        assertUnread(TestUtils.USER_ONE, "1");

        assertSetRead(nodeRef);
        assertUnread(TestUtils.USER_ONE, "0");
    }

    public void testSetSeenNotification() throws IOException, JSONException {
        log.debug("NotificationsTest.testCreateThreeNotificationsForUserOne");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);
        assertUnseen(TestUtils.USER_ONE, "1");

        assertSetSeen(nodeRef);
        assertUnseen(TestUtils.USER_ONE, "0");
    }

    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/notifications", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetAll (String userName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getAll");
        data.put("PARAM_USERNAME", userName);
        return executeWebScript(data);
    }

    private JSONArray assertGetAll (String userName, int expectedCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAll(userName);
        assertEquals(expectedCount, returnJSON.getJSONArray(1).length());
        return returnJSON;
    }

    private JSONArray assertUnseen (String userName, String expectedCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAll(userName);
        assertTrue(returnJSON.getJSONObject(0).has(UNSEEN));
        assertEquals(expectedCount, returnJSON.getJSONObject(0).getString(UNSEEN));
        return returnJSON;
    }

    private JSONArray assertUnread (String userName, String expectedCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAll(userName);
        assertTrue(returnJSON.getJSONObject(0).has(UNREAD));
        assertEquals(expectedCount, returnJSON.getJSONObject(0).getString(UNREAD));
        return returnJSON;
    }

    private JSONArray executeWebScriptAdd (String userName, String siteShortName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "add");
        data.put("PARAM_USERNAME", userName);
        data.put("PARAM_MESSAGE", "Test message");
        data.put("PARAM_SUBJECT", "Test subject");
        data.put("PARAM_LINK", "/#!/projekter/" + siteShortName + "?type=Project");
        data.put("PARAM_TYPE", "project");
        data.put("PARAM_PROJECT", siteShortName);
        return executeWebScript(data);
    }

    private JSONArray assertAdd (String userName, String SiteShortName) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptAdd(userName, SiteShortName);
        assertTrue(returnJSON.getJSONObject(0).has(NODE_REF));
        return returnJSON;
    }

    private JSONArray executeWebScriptWithNodeRef (String method, String NodeRef) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", method);
        data.put("PARAM_NODE_REF", NodeRef);
        return executeWebScript(data);
    }

    private JSONArray assertRemove (String nodeRef) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptWithNodeRef("remove", nodeRef);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));
        return returnJSON;
    }

    private JSONArray assertSetRead (String nodeRef) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptWithNodeRef("setRead", nodeRef);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));
        return returnJSON;
    }

    private JSONArray assertSetSeen (String nodeRef) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptWithNodeRef("setSeen", nodeRef);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));
        return returnJSON;
    }

    private String getNodeRef (JSONArray returnJSON) throws JSONException {
        //Get the nodeRef of the notification
        assertTrue(returnJSON.getJSONObject(0).has(NODE_REF));
        return returnJSON.getJSONObject(0).getString(NODE_REF);
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
    }
}