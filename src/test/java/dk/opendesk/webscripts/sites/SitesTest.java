package dk.opendesk.webscripts.sites;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.site.SiteInfo;
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
import java.util.HashMap;
import java.util.Map;

public class SitesTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(SitesTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private Map<String, SiteInfo> sites = new HashMap<>();

    public SitesTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // SITES
        sites.put(OpenDeskModel.DOC_TEMPLATE, null);
        sites.put(TestUtils.SITE_ONE, null);
        sites.put(TestUtils.SITE_TWO, null);
        sites.put(TestUtils.SITE_THREE, null);
        sites.put(TestUtils.SITE_FOUR, null);

        // Delete and purge and then create sites
        for (String siteShortName : sites.keySet()) {
            TestUtils.deleteSite(transactionService, siteService, siteShortName);
        }
        nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
    }

    public void testGetSite()  throws IOException, JSONException {
        log.debug("SitesTest.testGetSite");

        TestUtils.createSite(transactionService, siteService, TestUtils.SITE_ONE);
        assertGetSite(TestUtils.SITE_ONE);
    }

    public void testGetAll() throws IOException, JSONException {
        log.debug("SitesTest.testGetAll");

        //Get initial count
        JSONArray returnJSON = executeWebScriptGetAll("");
        int initialCount = returnJSON.length();

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }

        assertGetAll("", initialCount + sites.size());
    }

   /** webscripts **/

    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/sites", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetSite (String siteName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getSite");
        data.put("PARAM_SITE_SHORT_NAME", siteName);
        return executeWebScript(data);
    }

    private JSONArray executeWebScriptGetAll (String query) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getAll");
        data.put("PARAM_QUERY", query);
        return executeWebScript(data);
    }

    /** assertions **/

    private JSONArray assertGetSite (String siteShortName) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetSite(siteShortName);
        assertEquals(siteShortName, returnJSON.getJSONObject(0).get("shortName"));
        return returnJSON;
    }

    private JSONArray assertGetAll (String query, int siteCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetAll(query);
        assertEquals(siteCount, returnJSON.length());
        return returnJSON;
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
    }
}