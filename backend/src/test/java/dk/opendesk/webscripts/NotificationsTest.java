package dk.opendesk.webscripts;

import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NotificationsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(NotificationsTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private static final String UNSEEN = "unseen";
    private static final String UNREAD = "unread";
    private static final String PROJECT = "project";
    private static final String MESSAGE = "message";
    private static final String FILENAME = "filename";

    private List<String> users = new ArrayList<>();
    private Map<String, SiteInfo> sites = new HashMap<>();

    public NotificationsTest() {
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

        // SITES
        sites.put(TestUtils.SITE_ONE, null);
        sites.put(TestUtils.SITE_TWO, null);
        sites.put(TestUtils.SITE_THREE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }
    }

    public void testUserHasNoUnseenNotifications() throws IOException, JSONException {
        log.debug("NotificationsTest.testUserHasNoUnseenNotifications");

        assertUnseen(TestUtils.USER_ONE, "0");
    }

    public void testUserHasNoUnreadNotifications() throws IOException, JSONException {
        log.debug("NotificationsTest.testUserHasNoUnreadNotifications");

        assertUnread(TestUtils.USER_ONE, "0");
    }

    public void testCreateThreeProjectNotificationsForUserOne() throws IOException, JSONException {
        log.debug("NotificationsTest.testCreateThreeProjectNotificationsForUserOne");

        assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_ONE);
        assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_TWO);
        assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_THREE);

        assertGetAll(TestUtils.USER_ONE, 3);
    }

    public void testCreateTwoDocumentNotificationsForUserOne() throws IOException, JSONException {
        log.debug("NotificationsTest.testCreateTwoDocumentNotificationsForUserOne");

        NodeRef ref1 = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_ONE).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);
        NodeRef ref2 = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_TWO).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);
        assertAddNewDocumentNotification(TestUtils.USER_ONE, TestUtils.SITE_ONE, ref1);
        assertAddNewDocumentNotification(TestUtils.USER_ONE, TestUtils.SITE_TWO, ref2);

        assertGetAll(TestUtils.USER_ONE, 2);
    }

    public void testCreateOneDocumentNotificationAndGetInfo() throws IOException, JSONException {
        log.debug("NotificationsTest.testCreateThreeDocumentNotificationsForUserOne");
        JSONArray returnJSON;

        NodeRef ref = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_THREE).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);
        returnJSON = assertAddNewDocumentNotification(TestUtils.USER_ONE, TestUtils.SITE_THREE, ref);
        String nodeRef = getNodeRef(returnJSON);
        assertGetInfo(nodeRef, TestUtils.SITE_THREE);
    }

    public void testRemoveNotification() throws JSONException, IOException {
        log.debug("NotificationsTest.testRemoveNotification");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);

        assertGetAll(TestUtils.USER_ONE, 1);

        assertRemove(nodeRef);

        assertGetAll(TestUtils.USER_ONE, 0);
    }

    public void testSetReadNotification() throws IOException, JSONException {
        log.debug("NotificationsTest.testSetReadNotification");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);
        assertUnread(TestUtils.USER_ONE, "1");

        assertSetRead(nodeRef);
        assertUnread(TestUtils.USER_ONE, "0");
    }

    public void testSetSeenNotification() throws IOException, JSONException {
        log.debug("NotificationsTest.testSetSeenNotification");
        JSONArray returnJSON;

        //Adds one notification
        returnJSON = assertAddProjectNotification(TestUtils.USER_ONE, TestUtils.SITE_ONE);
        String nodeRef = getNodeRef(returnJSON);
        assertUnseen(TestUtils.USER_ONE, "1");

        assertSetSeen(nodeRef);
        assertUnseen(TestUtils.USER_ONE, "0");
    }

    public void testSetAllNotificationsSeen() throws IOException, JSONException {
        log.debug("NotificationsTest.testSetSeenNotification");
        JSONArray returnJSON;

        assertSetAllNotificationsSeen(TestUtils.USER_ONE);
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

    private JSONArray executeWebScriptAdd (String userName, String siteShortName, String link, String type) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "add");
        data.put("PARAM_USERNAME", userName);
        data.put("PARAM_MESSAGE", "Test message");
        data.put("PARAM_SUBJECT", "Test subject");
        data.put("PARAM_LINK", link);
        data.put("PARAM_TYPE", type);
        data.put("PARAM_PROJECT", siteShortName);
        return executeWebScript(data);
    }

    private JSONArray assertAdd (String userName, String siteShortName, String link, String type) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptAdd(userName, siteShortName, link, type);
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        return returnJSON;
    }

    private JSONArray assertAddProjectNotification (String userName, String siteShortName) throws IOException, JSONException {
        String link = "#!/projekter/" + siteShortName;
        String type = "project";
        return assertAdd(userName, siteShortName, link, type);
    }

    private JSONArray assertAddNewDocumentNotification (String userName, String siteShortName, NodeRef n) throws IOException, JSONException {
        String ref = n.getId();
        String link = "#!/dokument/" + ref;
        String type = "new-doc";
        return assertAdd(userName, siteShortName, link, type);
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

    //TODO: Change name to GetDocumentInfo - remember frontend refactoring
    private JSONArray assertGetInfo (String nodeRef, String project) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptWithNodeRef("getInfo", nodeRef);

        System.out.println(returnJSON);

        System.out.println(returnJSON.getJSONObject(0).has(MESSAGE));

        assertTrue(returnJSON.getJSONObject(0).has(MESSAGE));
//        assertTrue(returnJSON.getJSONObject(0).has(FILENAME));
//        assertTrue(returnJSON.getJSONObject(0).has(PROJECT));
//        assertEquals(project, returnJSON.getJSONObject(0).getString(PROJECT));
        return returnJSON;
    }

    private JSONArray executeWebScriptSetAllNotificationsSeen (String userName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "setAllNotificationsSeen");
        data.put("PARAM_USERNAME", userName);
        return executeWebScript(data);
    }

    private JSONArray assertSetAllNotificationsSeen (String userName) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptSetAllNotificationsSeen(userName);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));
        return returnJSON;
    }

    private String getNodeRef (JSONArray returnJSON) throws JSONException {
        //Get the nodeRef of the notification
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        return returnJSON.getJSONObject(0).getString(TestUtils.NODE_REF);
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        // Delete users
        for (String userName : users) {
            TestUtils.deletePerson(transactionService, personService, userName);
        }

        // Delete sites
        for (String siteShortName : sites.keySet()) {
            TestUtils.deleteSite(transactionService, siteService, authorityService, siteShortName);
        }
        nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
    }
}