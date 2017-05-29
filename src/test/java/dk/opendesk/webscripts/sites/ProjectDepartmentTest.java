package dk.opendesk.webscripts.sites;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
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

public class ProjectDepartmentTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(ProjectDepartmentTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");
    private NodeService nodeService = (NodeService) getServer().getApplicationContext().getBean("nodeService");
    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private List<String> users = new ArrayList<>();
    private String siteShortName;

    public ProjectDepartmentTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // USERS
        users.add(TestUtils.USER_ONE);

        // Create users
        for (String userName : users) {
            TestUtils.createUser(transactionService, personService, authenticationService, userName);
        }
    }

    /** Tests **/

    public void testCreatePDSITE()  throws IOException, JSONException {
        log.debug("ProjectDepartmentTest.testCreatePDSITE");

        JSONArray createReturnJSON = assertCreatePDSITE(TestUtils.SITE_NAME, TestUtils.SITE_ONE_DESC, "123", "C-TEST", TestUtils.ADMIN,
                TestUtils.USER_ONE, "PUBLIC", "");

        siteShortName = createReturnJSON.getJSONObject(0).get(TestUtils.SHORTNAME).toString();
    }

    public void testUpdatePDSITE()  throws IOException, JSONException {
        log.debug("ProjectDepartmentTest.testUpdatePDSITE");

        JSONArray createReturnJSON = assertCreatePDSITE(TestUtils.SITE_NAME, TestUtils.SITE_ONE_DESC, "123", "C-TEST",
                TestUtils.ADMIN, TestUtils.USER_ONE, "PUBLIC", "");

        siteShortName = createReturnJSON.getJSONObject(0).get(TestUtils.SHORTNAME).toString();

        assertUpdatePDSITE(TestUtils.SITE_NAME, TestUtils.SITE_ONE_DESC, "456", "C-TEST", TestUtils.ADMIN,
                TestUtils.USER_ONE, "PUBLIC", "", siteShortName, "CLOSED");
    }


    /** Assertions **/

    private JSONArray assertCreatePDSITE (String name, String description, String sbsys, String centerId,
                                          String owner, String manager, String visibility, String template)
            throws IOException, JSONException {

        JSONArray returnJSON = executeCreatePDSITE(name, description, sbsys, centerId, owner, manager, visibility,
                template);

        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.NODE_REF));
        assertTrue(returnJSON.getJSONObject(0).has(TestUtils.SHORTNAME));
        return returnJSON;
    }

    private JSONArray assertUpdatePDSITE (String name, String description, String sbsys, String centerId,
                                          String owner, String manager, String visibility, String template,
                                          String shortName, String state) throws IOException, JSONException {

        JSONArray returnJSON = executeUpdatePDSITE(name, description, sbsys, centerId, owner, manager, visibility,
                template, shortName, state);
        assertEquals(TestUtils.SUCCESS, returnJSON.getJSONObject(0).getString(TestUtils.STATUS));

        NodeRef n = siteService.getSite(shortName).getNodeRef();
        String actualCenterId = (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_CENTERID);
        assertEquals(centerId, actualCenterId);

        return returnJSON;
    }

    /** Webscripts **/

    private JSONArray executeCreatePDSITE (String name, String description, String sbsys, String centerId,
                                           String owner, String manager, String visibility, String template)
            throws IOException, JSONException {

        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "createPDSITE");
        data.put("PARAM_NAME", name);
        data.put("PARAM_DESCRIPTION", description);
        data.put("PARAM_SBSYS", sbsys);
        data.put("PARAM_CENTERID", centerId);
        data.put("PARAM_OWNER", owner);
        data.put("PARAM_MANAGER", manager);
        data.put("PARAM_VISIBILITY", visibility);
        data.put("PARAM_TEMPLATE", template);
        return executeWebScript(data, TestUtils.ADMIN);
    }

    private JSONArray executeUpdatePDSITE (String name, String description, String sbsys, String centerId, String owner,
                                           String manager, String visibility, String template, String shortName,
                                           String state) throws IOException, JSONException {

        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "updatePDSITE");
        data.put("PARAM_NAME", name);
        data.put("PARAM_DESCRIPTION", description);
        data.put("PARAM_SBSYS", sbsys);
        data.put("PARAM_CENTERID", centerId);
        data.put("PARAM_OWNER", owner);
        data.put("PARAM_MANAGER", manager);
        data.put("PARAM_VISIBILITY", visibility);
        data.put("PARAM_TEMPLATE", template);
        data.put("PARAM_SITE_SHORT_NAME", shortName);
        data.put("PARAM_STATE", state);
        return executeWebScript(data, TestUtils.ADMIN);
    }

    /** Root Webscript **/

    private JSONArray executeWebScript (JSONObject data, String userName) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/projectdepartment", data.toString(), "application/json");
        if(!TestUtils.ADMIN.equals(userName))
            AuthenticationUtil.setFullyAuthenticatedUser(userName);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        if(!TestUtils.ADMIN.equals(userName))
            AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
        return new JSONArray(response.getContentAsString());
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        for (String userName : users) {
            TestUtils.deletePerson(transactionService, personService, userName);
        }

        if(siteShortName != null) {
            TestUtils.deleteSite(transactionService, siteService, authorityService, siteShortName);
            nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
        }
    }
}