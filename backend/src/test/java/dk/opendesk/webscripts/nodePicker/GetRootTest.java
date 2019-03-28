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
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetRootTest extends OpenDeskWebScriptTest {
    private NodeRef userHome;

    public GetRootTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        // Needs to be set outside this method as this is run as the admin
        userHome = null;
    }

    public void testGetUserHomeAsRootNode() throws IOException, JSONException {
        JSONObject result = execute();
        JSONArray children = result.getJSONArray("children");
        assertEquals(3, children.length());
        assertChild(children, 0, OpenDeskModel.NODE_PICKER_MY_DOCS);
        assertChild(children, 1, OpenDeskModel.NODE_PICKER_SHARED_DOCS);
        assertChild(children, 2, OpenDeskModel.NODE_PICKER_SITES);
        assertNodeRefOnMyDocs(children);
    }

    private void assertChild(JSONArray children, int i, String rootName) throws JSONException {
        JSONObject child = children.getJSONObject(i);
        assertEquals(rootName, child.getString("rootName"));
    }

    private void assertNodeRefOnMyDocs(JSONArray children) throws JSONException {
        AuthenticationUtil.runAs(() -> {
            userHome = nodeBean.getUserHome();
            return null;
        }, USER_ONE);
        String userHomeStr = userHome.toString();
        assertEquals(userHomeStr, children.getJSONObject(0).getString("nodeRef"));
    }

    private JSONObject execute() throws IOException, JSONException {
        String uri = "nodepicker/root";
        return executeGetObject(uri, USER_ONE);
    }
}
