//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

package dk.opendesk.webscripts.nodePicker;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetRootNodeTest extends OpenDeskWebScriptTest {

    public GetRootNodeTest() {
        super();
    }

    public void testGetUserHomeAsRootNode() throws IOException, JSONException {
        assertRootNode(OpenDeskModel.NODE_PICKER_MY_DOCS);
    }

    public void testGetSharedDocsAsRootNode() throws IOException, JSONException {
        assertRootNode(OpenDeskModel.NODE_PICKER_SHARED_DOCS);
    }

    public void testGetSitesAsRootNode() throws IOException, JSONException {
        assertRootNode(OpenDeskModel.NODE_PICKER_SITES);
    }

    private void assertRootNode(String rootName) throws IOException, JSONException {
        JSONObject result = execute(rootName);
        assertEquals(rootName, result.getString("rootName"));
        assertTrue(result.has("children"));
    }

    private JSONObject execute(String rootName) throws IOException, JSONException {
        String uri = "nodepicker/root/" + rootName;
        return executeGetObject(uri, USER_ONE);
    }
}
