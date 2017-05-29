package dk.opendesk.webscripts.documents;

import dk.opendesk.repo.model.OpenDeskModel;
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
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.junit.Test;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class TemplateTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(TemplateTest.class);

    private NodeService nodeService = (NodeService) getServer().getApplicationContext().getBean("nodeService");
    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

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
        sites.put(OpenDeskModel.DOC_TEMPLATE, null);
        sites.put(TestUtils.SITE_ONE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }

        Map<QName, Serializable> aspectProps = new HashMap<>();
        NodeRef templateDocumentRef = sites.get(OpenDeskModel.DOC_TEMPLATE).getNodeRef();
        templateDocLib = siteService.getContainer(OpenDeskModel.DOC_TEMPLATE, OpenDeskModel.DOC_LIBRARY);

        TestUtils.addAspect(transactionService, nodeService, templateDocumentRef, OpenDeskModel.ASPECT_PD_DOCUMENT,
                aspectProps);
    }

    public void testGetAll4TemplateDocuments() throws IOException, JSONException {
        log.debug("TemplateTest.testGetAll4TemplateDocuments");

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE1);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE2);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE3);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE4);

        assertWebScriptGetAllTemplateDocuments(4);
    }

    private JSONArray assertWebScriptGetAllTemplateDocuments(int templateCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAllTemplateDocuments();
        assertEquals(templateCount, returnJSON.getJSONArray(0).length());
        return returnJSON;
    }

    private JSONArray executeWebScriptGetAllTemplateDocuments () throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("method", "getAllTemplateDocuments");
            }
        };
        return executeWebScript(args);
    }

    public void testMakeNewDocumentFromTemplate() throws IOException, JSONException {
        log.debug("TemplateTest.testMakeNewDocumentFromTemplate");

        NodeRef docTemplate = TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                templateDocLib, TestUtils.FILE_TEST_TEMPLATE1);
        String templateNodeId = docTemplate.getId();

        NodeRef docLib = siteService.getContainer(TestUtils.SITE_ONE, OpenDeskModel.DOC_LIBRARY);
        String destinationNodeId = docLib.toString();

        assertWebScriptMakeNewDocumentFromTemplate(TestUtils.FILE_TEST_FROM_TEMPLATE1, templateNodeId, destinationNodeId);
    }

    private JSONArray assertWebScriptMakeNewDocumentFromTemplate(String nodeName, String templateNodeId,
                                                                 String destinationNodeRefStr)
            throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptMakeNewDocumentFromTemplate(nodeName, templateNodeId, destinationNodeRefStr);
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.FILENAME));
        return returnJSON;
    }

    private JSONArray executeWebScriptMakeNewDocumentFromTemplate (String nodeName, String templateNodeId,
                                                               String destinationNodeRefStr)
            throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("method", "makeNewDocumentFromTemplate");
                put("fileName", nodeName);
                put("template_nodeid", templateNodeId);
                put("destination_nodeRefid", destinationNodeRefStr);
            }
        };
        return executeWebScript(args);
    }

    private JSONArray executeWebScript (Map<String, String> args) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest("template").setArgs(args);
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