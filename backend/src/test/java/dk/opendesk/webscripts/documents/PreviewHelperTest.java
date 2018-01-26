package dk.opendesk.webscripts.documents;

import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PreviewHelperTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(PreviewHelperTest.class);

    private NodeService nodeService = (NodeService) getServer().getApplicationContext().getBean("nodeService");
    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private VersionService versionService = (VersionService) getServer().getApplicationContext().getBean("versionService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private Map<String, SiteInfo> sites = new HashMap<>();
    private String docId;
    private String versionId;

    public PreviewHelperTest() {
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

        NodeRef docRef = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                sites.get(TestUtils.SITE_ONE).getNodeRef(), TestUtils.FILE_TEST_UPLOAD);

        docId = docRef.getId();

        Map<String, Serializable> versionProperties = new HashMap<>();
        Version version = TestUtils.createVersion(transactionService, versionService, docRef, versionProperties);
        versionId = version.getFrozenStateNodeRef().getId();
    }

    public void testCleanUp() throws IOException, JSONException {
        log.debug("PreviewHelperTest.testCleanUp");

        assertWebScriptCleanUp(docId);
    }
    private JSONArray executeWebScript (Map<String, String> args) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("previewhelper").setArgs(args);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptCleanUp (String versionNodeId) throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("method", "cleanUp");
                put("version_node", versionNodeId);
            }
        };
        return executeWebScript(args);
    }

    private JSONArray assertWebScriptCleanUp(String versionNodeId) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptCleanUp(versionNodeId);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));
        return returnJSON;
    }

    public void testCreateThumbnail() throws IOException, JSONException {
        log.debug("PreviewHelperTest.testCreateThumbnail");

        assertWebScriptCreateThumbnail(docId, versionId);
    }

    private JSONArray executeWebScriptCreateThumbnail (String parentDocRef, String versionNodeId) throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("parent_node", parentDocRef);
                put("version_node", versionNodeId);
            }
        };
        return executeWebScript(args);
    }

    private JSONArray assertWebScriptCreateThumbnail(String parentDocRef, String versionNodeId) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptCreateThumbnail(parentDocRef, versionNodeId);
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        return returnJSON;
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        // Delete sites
        for (String siteShortName : sites.keySet()) {
            TestUtils.deleteSite(transactionService, siteService, authorityService, siteShortName);
        }
        nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
    }
}