package dk.opendesk.webscripts.documents;

import dk.opendesk.webscripts.TestUtils;
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
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PermissionsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(PermissionsTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private List<String> users = new ArrayList<>();
    private Map<String, SiteInfo> sites = new HashMap<>();
    private NodeRef docRef;

    public PermissionsTest() {
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

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }

        docRef = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_ONE).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);
    }

    public void testGetAllowedEditPermissionAsAdmin() throws IOException, JSONException {
        log.debug("PermissionsTest.testCreateDocumentAndGetAllowedEditPermission");

        assertWebScriptGetEditPermission(TestUtils.ADMIN, "workspace", "SpacesStore", docRef.getId(), "ALLOWED");
    }

    public void testGetDeniedEditPermissionAsUserOne() throws IOException, JSONException {
        log.debug("PermissionsTest.testCreateDocumentAndGetAllowedEditPermission");

        assertWebScriptGetEditPermission(TestUtils.USER_ONE, "workspace", "SpacesStore", docRef.getId(), "DENIED");
    }

    private JSONArray executeWebScript (Map<String, String> args, String userName) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("permissions").setArgs(args);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetEditPermission (String userName, String storeType, String storeId, String nodeId) throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("method", "getEditPermission");
                put("STORE_TYPE", storeType);
                put("STORE_ID", storeId);
                put("NODE_ID", nodeId);
            }
        };
        return executeWebScript(args, userName);
    }

    private JSONArray assertWebScriptGetEditPermission (String userName, String storeType, String storeId, String nodeId, String accessStatus) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetEditPermission(userName, storeType, storeId, nodeId);
        assertTrue(returnJSON.getJSONObject(0).has("edit_permission"));
        assertEquals(accessStatus, returnJSON.getJSONObject(0).getString("edit_permission"));
        return returnJSON;
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