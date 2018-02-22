package dk.opendesk.webscripts.documents;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.model.Repository;
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
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class TemplateTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(TemplateTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");
    private Repository repository = (Repository) getServer().getApplicationContext().getBean("repositoryHelper");

    private Map<String, SiteInfo> sites = new HashMap<>();
    private NodeRef templateDocLib;

    public TemplateTest() {
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

        templateDocLib = TestUtils.getDocumentTemplateRef(repository, fileFolderService);
    }

    public void testGetDocumentTemplates() throws IOException, JSONException {
        log.debug("TemplateTest.GetDocumentTemplates");

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE1);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE2);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE3);

        assertWebScriptGetDocumentTemplates(3);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE4);

        assertWebScriptGetDocumentTemplates(4);
    }

    private JSONArray assertWebScriptGetDocumentTemplates(int templateCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetDocumentTemplates();
        assertEquals(templateCount, returnJSON.getJSONArray(0).length());
        return returnJSON;
    }

    private JSONArray executeWebScriptGetDocumentTemplates () throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getDocumentTemplates");

        return executeWebScript(data);
    }

    public void testCreateContentFromTemplate() throws IOException, JSONException {
        log.debug("TemplateTest.testCreateContentFromTemplate");

        NodeRef docTemplate = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_FROM_TEMPLATE1);
        String templateNodeId = docTemplate.getId();

        NodeRef docLib = siteService.getContainer(TestUtils.SITE_ONE, OpenDeskModel.DOC_LIBRARY);
        String destinationNodeId = docLib.toString();

        assertWebScriptCreateContentFromTemplate(TestUtils.FILE_TEST_FROM_TEMPLATE1, templateNodeId, destinationNodeId);
    }

    public void testCreateContentFromTemplateWithoutExtension() throws IOException, JSONException {
        log.debug("TemplateTest.testCreateContentFromTemplateWithoutExtension");

        NodeRef docTemplate = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE1_WITHOUT_EXT);
        String templateNodeId = docTemplate.getId();

        NodeRef docLib = siteService.getContainer(TestUtils.SITE_ONE, OpenDeskModel.DOC_LIBRARY);
        String destinationNodeId = docLib.toString();

        assertWebScriptCreateContentFromTemplate(TestUtils.FILE_TEST_TEMPLATE1_WITHOUT_EXT, templateNodeId, destinationNodeId);
    }

    private JSONArray assertWebScriptCreateContentFromTemplate(String nodeName, String templateNodeId,
                                                               String destinationNodeRefStr)
            throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptCreateContentFromTemplate(nodeName, templateNodeId, destinationNodeRefStr);
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.FILENAME));
        return returnJSON;
    }

    private JSONArray executeWebScriptCreateContentFromTemplate(String nodeName, String templateNodeId,
                                                                String destinationNodeRefStr)
            throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "createContentFromTemplate");
        data.put("PARAM_NODE_NAME", nodeName);
        data.put("PARAM_TEMPLATE_NODE_ID", templateNodeId);
        data.put("PARAM_DESTINATION_NODEREF", destinationNodeRefStr);

        return executeWebScript(data);
    }

    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/template", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
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