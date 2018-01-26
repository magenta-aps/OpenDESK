package dk.opendesk.webscripts.users;

import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.PersonService;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UsersTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(UsersTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private List<String> users = new ArrayList<>();
    private Map<String, SiteInfo> sites = new HashMap<>();

    private static final String USERNAME = "userName";

    SiteInfo site_one;

    public UsersTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        // USERS
        users.add(TestUtils.USER_ONE);

        // SITES
        sites.put(TestUtils.SITE_ONE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }
    }

    public void testCreateOneExternalUser() throws IOException, JSONException {
        log.debug("UsersTest.createsOneExternalUser");

        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "createExternalUser");
        data.put("PARAM_SITE_SHORT_NAME", TestUtils.SITE_ONE);
        data.put("PARAM_FIRSTNAME", TestUtils.USER_ONE_FIRSTNAME);
        data.put("PARAM_LASTNAME", TestUtils.USER_ONE_LASTNAME);
        data.put("PARAM_EMAIL", TestUtils.USER_ONE_EMAIL);
        data.put("PARAM_GROUP_NAME", TestUtils.USER_ONE_GROUP);

        JSONArray returnJSON = executeWebScript(data);

        assertTrue(returnJSON.getJSONObject(0).has(USERNAME));
        assertEquals(TestUtils.USER_ONE, returnJSON.getJSONObject(0).getString(USERNAME));

        // Tear Down
        TestUtils.deletePerson(transactionService, personService, TestUtils.USER_ONE);
    }

    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/users", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    @Override
    protected void tearDown() throws Exception {
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