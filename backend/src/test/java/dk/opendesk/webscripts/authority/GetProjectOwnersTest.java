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

public class GetProjectOwnersTest extends OpenDeskWebScriptTest {

    private String uri = "/authority/project-owners";

    public GetProjectOwnersTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        // USERS
        users.add(USER_TWO);
        users.add(USER_THREE);
        users.add(USER_FOUR);
    }

    public void testGetProjectOwnersGroupShortName() throws IOException, JSONException {
        JSONObject returnJSON = executeGetObject(uri);
        String shortName = returnJSON.getString(SHORTNAME);
        assertEquals(OpenDeskModel.PROJECT_OWNERS, shortName);
    }

    public void testGet4MembersOfProjectOwners() throws IOException, JSONException {
        String organizationalCentersGroup = "GROUP_" + OpenDeskModel.PROJECT_OWNERS;
        addToAuthority(organizationalCentersGroup, USER_ONE);
        addToAuthority(organizationalCentersGroup, USER_THREE);
        addToAuthority(organizationalCentersGroup, USER_FOUR);
        JSONObject returnJSON = executeGetObject(uri);
        JSONArray members = returnJSON.getJSONArray(MEMBERS);
        // Per default OpenDesk already contains one member of this group
        assertEquals(4, members.length());
    }
}
