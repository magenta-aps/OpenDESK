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
    private static final String NODE_REF = "nodeRef";

    public NotificationsTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setRunAsUserSystem();

        // Create users
        TestUtils.createUser(transactionService, personService, authenticationService, TestUtils.USER_ONE);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_ONE);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_TWO);
        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_THREE);
    }

    @Test
    public void testUserHasNoUnseenNotifications() {
        log.debug("NotificationsTest.testUserHasNoUnseenNotifications");
        JSONArray returnJSON;

        try {
            //Gets all notifications for user one
            returnJSON = executeWebScriptGetAll(TestUtils.USER_ONE);
            assertTrue(returnJSON.getJSONObject(0).has(UNSEEN));
            assertEquals("0", returnJSON.getJSONObject(0).getString(UNSEEN)); //unseen count should be zero

        } catch (IOException ex) {
            log.error("IOException", ex);
        } catch (JSONException ex) {
            log.error("JSONException", ex);
        }
    }

    @Test
    public void testCreateThreeNotificationsForUserOne() {
        log.debug("NotificationsTest.testCreateThreeNotificationsForUserOne");
        JSONArray returnJSON;

        try {
            //Adds three notifications
            returnJSON = executeWebScriptAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
            assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

            returnJSON = executeWebScriptAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_TWO);
            assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

            returnJSON = executeWebScriptAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_THREE);
            assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

            //Gets all notifications for user one
            returnJSON = executeWebScriptGetAll(TestUtils.USER_ONE);
            assertTrue(returnJSON.getJSONObject(0).has(UNSEEN));
            assertEquals("3", returnJSON.getJSONObject(0).getString(UNSEEN)); //unseen count should be three

        } catch (IOException ex) {
            log.error("IOException", ex);
        } catch (JSONException ex) {
            log.error("JSONException", ex);
        }
    }

    @Test
    public void testRemoveNotification() {
        log.debug("NotificationsTest.testRemoveNotification");
        JSONArray returnJSON;

        try {
            returnJSON = executeWebScriptAdd(TestUtils.USER_ONE, TestUtils.USER_ONE_SITE_ONE);
            assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

            //Gets all notifications for user one
            returnJSON = executeWebScriptGetAll(TestUtils.USER_ONE);
            assertTrue(returnJSON.getJSONObject(0).has(UNSEEN));
            assertEquals("1", returnJSON.getJSONObject(0).getString(UNSEEN)); //unseen count should be zero

            //Get the nodeRef of the notification
            assertTrue(returnJSON.getJSONArray(1).getJSONObject(0).has(NODE_REF));
            String nodeRef = returnJSON.getJSONArray(1).getJSONObject(0).getString(NODE_REF);

            //Remove same notification
            returnJSON = executeWebScriptRemove(nodeRef);
            assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

            //Gets all notifications for user one
            returnJSON = executeWebScriptGetAll(TestUtils.USER_ONE);
            assertTrue(returnJSON.getJSONObject(0).has(UNSEEN));
            assertEquals("0", returnJSON.getJSONObject(0).getString(UNSEEN)); //unseen count should be zero

        } catch (IOException ex) {
            log.error("IOException", ex);
        } catch (JSONException ex) {
            log.error("JSONException", ex);
        }
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

    private JSONArray executeWebScriptRemove (String NodeRef) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "remove");
        data.put("PARAM_NODE_REF", NodeRef);
        return executeWebScript(data);
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
        TestUtils.deletePerson(transactionService, personService, TestUtils.USER_ONE);
    }
}