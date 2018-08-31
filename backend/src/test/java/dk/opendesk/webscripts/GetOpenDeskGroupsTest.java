package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
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

public class GetOpenDeskGroupsTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(GetOpenDeskGroupsTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private List<String> users = new ArrayList<>();
    private Map<String, SiteInfo> sites = new HashMap<>();

    public GetOpenDeskGroupsTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // USERS
        users.add(TestUtils.USER_ONE);
        users.add(TestUtils.USER_TWO);
        users.add(TestUtils.USER_THREE);
        users.add(TestUtils.USER_FOUR);
        users.add(TestUtils.USER_FIVE);

        for (String userName : users) {
            TestUtils.createUser(transactionService, personService, authenticationService, userName);
        }

        // SITES
        sites.put(TestUtils.SITE_ONE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }
    }

    public void testGetUserOneThreeAndFourAsMembersOfGroup() throws IOException, JSONException {
        log.debug("NotificationsTest.testUserHasNoUnseenNotifications");

        String group = "Site" + OpenDeskModel.CONSUMER;

        String consumerGroup = Utils.getAuthorityName(TestUtils.SITE_ONE, group);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_ONE);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_THREE);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_FOUR);

        assertWebScriptGetGroupMembers(consumerGroup.replace("GROUP_", ""), 3);
    }

    public void testGetGroupsAndMembers() throws IOException, JSONException {
        log.debug("NotificationsTest.testUserHasNoUnseenNotifications");

        String group = "Site" + OpenDeskModel.CONSUMER;

        SiteInfo siteONE = sites.get(TestUtils.SITE_ONE);

        String consumerGroup = Utils.getAuthorityName(TestUtils.SITE_ONE, group);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_ONE);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_THREE);
        TestUtils.addToAuthority(transactionService, authorityService, consumerGroup, TestUtils.USER_FOUR);

        assertWebScriptGetGroupsAndMembers(siteONE.getShortName());
    }




    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/groups", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetGroupMembers (String groupName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getGroupMembers");
        data.put("PARAM_GROUP_NAME", groupName);
        return executeWebScript(data);
    }

    private JSONArray assertWebScriptGetGroupMembers (String groupName, int memberCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetGroupMembers(groupName);
        assertEquals(memberCount, returnJSON.length());
        return returnJSON;
    }

    private JSONArray executeWebScriptGetGroupsAndMembers(String groupName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getGroupsAndMembers");
        data.put("PARAM_SITE_SHORT_NAME", groupName);
        return executeWebScript(data);
    }

    private JSONArray assertWebScriptGetGroupsAndMembers (String groupName) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScriptGetGroupsAndMembers(groupName);

        int numberOfGroups = 4;
        assertEquals(numberOfGroups, returnJSON.length());

        int l = 0;
        boolean found = false;
        JSONArray result = null;

        while (!found && l<numberOfGroups) {

            JSONArray group = returnJSON.getJSONArray(l);

            String shortName = group.getJSONObject(0).getString("shortName");
            System.out.println(shortName);

            if (shortName.equals("Site" + OpenDeskModel.CONSUMER)) {
                found = true;
                result = group;
            }
            l++;
        }


        int numberOfMembers = 3;
        assertEquals(numberOfMembers, result.getJSONArray(1).length());


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
