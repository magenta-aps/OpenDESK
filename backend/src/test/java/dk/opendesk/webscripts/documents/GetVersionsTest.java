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
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class GetVersionsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(GetVersionsTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private VersionService versionService = (VersionService) getServer().getApplicationContext().getBean("versionService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private Map<String, SiteInfo> sites = new HashMap<>();
    private NodeRef docRef;

    public GetVersionsTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // SITES
        sites.put(TestUtils.SITE_ONE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }

        docRef = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_ONE).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);
    }

    public void testCreate4VersionsAndGetAllVersions() throws IOException, JSONException {
        log.debug("GetVersionsTest.testCreate4VersionsAndGetAllVersions");

        Map<String, Serializable> versionProperties = new HashMap<>();

        // The initial createVersion adds the first version and a version history. See docs.
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);

        assertWebScriptGetAll("workspace", "SpacesStore", docRef.getId(), 4);
    }

    public void testCreate10VersionsAndGetAllVersions() throws IOException, JSONException {
        log.debug("GetVersionsTest.testCreate10VersionsAndGetAllVersions");

        Map<String, Serializable> versionProperties = new HashMap<>();

        // The initial createVersion adds the first version and a version history. See docs.
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);

        assertWebScriptGetAll("workspace", "SpacesStore", docRef.getId(), 10);
    }

    private JSONArray executeWebScript (Map<String, String> args) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("history").setArgs(args);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetAll (String storeType, String storeId, String nodeId) throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("method", "getAll");
                put("STORE_TYPE", storeType);
                put("STORE_ID", storeId);
                put("NODE_ID", nodeId);
            }
        };
        return executeWebScript(args);
    }

    private JSONArray assertWebScriptGetAll (String storeType, String storeId, String nodeId, int versionCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAll(storeType, storeId, nodeId);
        assertEquals(versionCount, returnJSON.length());
        return returnJSON;
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        // Delete and purge and then create sites
        for (String siteShortName : sites.keySet()) {
            TestUtils.deleteSite(transactionService, siteService, authorityService, siteShortName);
        }
        nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
    }
}
