package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.security.AuthorityType;
import org.json.JSONArray;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

public class GetAuthoritiesTest extends OpenDeskWebScriptTest {

    @Override
    public void setUp() throws Exception {
        super.setUp();

        transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            // Add a couple of groups
            authorityService.createAuthority(AuthorityType.GROUP, "group1");
            authorityService.createAuthority(AuthorityType.GROUP, "group2");

            // Added users to the groups
            authorityService.addAuthority("GROUP_group1", USER_THREE);
            authorityService.addAuthority("GROUP_group2", USER_FOUR);

            return true;
        });
    }

    @Override
    protected void AddUsersAndSites() {
        users.add(USER_TWO);
        users.add(USER_THREE);
        users.add(USER_FOUR);
        sites.put(SITE_ONE, null);
    }

    public void testGroupsContain_Empty_User_UserUser_Group() throws Exception {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_ONE, USER_TWO, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_ONE, "GROUP_group1", OpenDeskModel.SITE_CONTRIBUTOR);
            return null;
        }, ADMIN);

        JSONArray authorities = executeGetArray("/site/" + SITE_ONE + "/authorities");

        JSONAssert.assertEquals(
                getJSONFromResources(JSON_RESOURCE_PATH + "/site/get_authorities1.json"),
                authorities,
                JSONCompareMode.STRICT
        );
    }
}

// TODO: test for case where the user calling this webscript is not allowed to access the site
// TODO: test PD-project case