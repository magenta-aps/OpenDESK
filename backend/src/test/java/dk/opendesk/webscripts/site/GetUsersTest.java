package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONObject;

public class GetUsersTest extends OpenDeskWebScriptTest {

    @Override
    protected void AddUsersAndSites() {
        super.AddUsersAndSites();
        users.add(USER_TWO);
        users.add(USER_THREE);
        sites.put(SITE_ONE, null);
    }

    public void testSiteTypeProjectNoPagination() throws Exception {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_ONE, USER_TWO, OpenDeskModel.SITE_CONTRIBUTOR);
            addMemberToSite(SITE_ONE, USER_THREE, OpenDeskModel.SITE_CONTRIBUTOR);
            return null;
        }, ADMIN);

        JSONArray users = executeGetArray("/site/" + SITE_ONE + "/users", ADMIN);

        // Tempting to make a loop over the groups to perform the tests below, but let's not do that
        // in order to avoid "logic" in the test code

        // SiteManagers
        JSONObject group = users.getJSONObject(0);
        JSONArray members = group.getJSONArray("members");

        assertEquals(5, group.length());
        assertTrue(group.getBoolean("multipleMembers"));
        assertFalse(group.getBoolean("collapsed"));
        assertEquals(1, members.length());
        assertEquals(1, group.getInt("totalMembersCount"));
        assertEquals(OpenDeskModel.SITE_MANAGER, group.getString("shortName"));
        assertEquals(ADMIN, members.getJSONObject(0).getString("userName"));

        // SiteCollaborators
        group = users.getJSONObject(1);
        members = group.getJSONArray("members");

        assertEquals(5, group.length());
        assertTrue(group.getBoolean("multipleMembers"));
        assertFalse(group.getBoolean("collapsed"));
        assertEquals(1, members.length());
        assertEquals(1, group.getInt("totalMembersCount"));
        assertEquals(OpenDeskModel.SITE_COLLABORATOR, group.getString("shortName"));
        assertEquals(USER_ONE, members.getJSONObject(0).getString("userName"));

        // SiteContributors
        group = users.getJSONObject(2);
        members = group.getJSONArray("members");

        assertEquals(5, group.length());
        assertTrue(group.getBoolean("multipleMembers"));
        assertFalse(group.getBoolean("collapsed"));
        assertEquals(2, members.length());
        assertEquals(2, group.getInt("totalMembersCount"));
        assertEquals(OpenDeskModel.SITE_CONTRIBUTOR, group.getString("shortName"));
        assertEquals(USER_THREE, members.getJSONObject(0).getString("userName"));
        assertEquals(USER_TWO, members.getJSONObject(1).getString("userName"));

        // SiteConsumers
        group = users.getJSONObject(3);
        members = group.getJSONArray("members");

        assertEquals(5, group.length());
        assertTrue(group.getBoolean("multipleMembers"));
        assertFalse(group.getBoolean("collapsed"));
        assertEquals(0, members.length());
        assertEquals(0, group.getInt("totalMembersCount"));
        assertEquals(OpenDeskModel.SITE_CONSUMER, group.getString("shortName"));
    }

}

////// siteType = project
// multipleMember = true
// collapse = false
// members = []
// totalMembersCount
// shortName

// test member json
