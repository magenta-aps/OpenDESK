// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.authority;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static dk.opendesk.repo.model.OpenDeskModel.ORGANIZATIONAL_CENTERS;
import static dk.opendesk.repo.model.OpenDeskModel.PROJECT_OWNERS;

public class GetOpenDeskGroupsTest extends OpenDeskWebScriptTest {

    private String uri = "/authority/openDeskGroups";

    public GetOpenDeskGroupsTest() {
        super();
    }

    public void testGetOpenDeskGroups() throws IOException, JSONException {
        JSONArray returnJSON = executeGetArray(uri);
        assertEquals(2, returnJSON.length());
    }

    public void testGetOpenDeskGroupsNames() throws IOException, JSONException {
        List<String> odGroups = new ArrayList<>();
        odGroups.add(PROJECT_OWNERS);
        odGroups.add(ORGANIZATIONAL_CENTERS);
        JSONArray returnJSON = executeGetArray(uri);
        for (int i = 0; i < returnJSON.length(); i++) {
            assertTrue(odGroups.contains(returnJSON.getJSONObject(i).getString(SHORTNAME)));
        }
    }
}
