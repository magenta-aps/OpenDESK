// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.authority;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetOpenDeskGroupTest extends OpenDeskWebScriptTest {

    public GetOpenDeskGroupTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        // USERS
        users.add(USER_TWO);
        users.add(USER_THREE);
        users.add(USER_FOUR);
        users.add(USER_FIVE);
    }

    public void testGetOrganizationalCentersGroupShortName() throws IOException, JSONException {
        JSONObject returnJSON = executeWebScript(OpenDeskModel.ORGANIZATIONAL_CENTERS);
        String shortName = returnJSON.getString(SHORTNAME);
        assertEquals(OpenDeskModel.ORGANIZATIONAL_CENTERS, shortName);
    }

    public void testGetProjectOwnersShortName() throws IOException, JSONException {
        JSONObject returnJSON = executeWebScript(OpenDeskModel.PROJECT_OWNERS);
        String shortName = returnJSON.getString(SHORTNAME);
        assertEquals(OpenDeskModel.PROJECT_OWNERS, shortName);
    }

    public void testGet4MembersOfOrganizationalCenters() throws IOException, JSONException {
        String organizationalCentersGroup = "GROUP_" + OpenDeskModel.ORGANIZATIONAL_CENTERS;
        addToAuthority(organizationalCentersGroup, USER_ONE);
        addToAuthority(organizationalCentersGroup, USER_THREE);
        addToAuthority(organizationalCentersGroup, USER_FOUR);
        JSONObject returnJSON = executeWebScript(OpenDeskModel.ORGANIZATIONAL_CENTERS);
        JSONArray members = returnJSON.getJSONArray(MEMBERS);
        // Per default OpenDesk already contains one member of this group
        assertEquals(4, members.length());
    }

    public void testGet5MembersOfProjectOwners() throws IOException, JSONException {
        String projectOwnersGroup = "GROUP_" + OpenDeskModel.PROJECT_OWNERS;
        addToAuthority(projectOwnersGroup, USER_ONE);
        addToAuthority(projectOwnersGroup, USER_THREE);
        addToAuthority(projectOwnersGroup, USER_FOUR);
        addToAuthority(projectOwnersGroup, USER_FIVE);
        JSONObject returnJSON = executeWebScript(OpenDeskModel.PROJECT_OWNERS);
        JSONArray members = returnJSON.getJSONArray(MEMBERS);
        // Per default OpenDesk already contains one member of this group
        assertEquals(5, members.length());
    }

    private JSONObject executeWebScript (String groupName) throws IOException, JSONException {
        String uri = "/authority/openDeskGroup/" + groupName;
        return executeGetObject(uri);
    }
}
