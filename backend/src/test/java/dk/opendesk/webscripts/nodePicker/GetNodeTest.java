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
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetNodeTest extends OpenDeskWebScriptTest {

    private NodeRef docLibRef;
    private NodeRef folderRef;
    private NodeRef userHome;

    public GetNodeTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        docLibRef = siteBean.getDocumentLibraryRef(SITE_ONE);
        folderRef = createFolder(docLibRef, FOLDER_TEST);
        // Needs to be set outside this method as this is run as the admin
        userHome = null;
    }

    public void testGetSiteNameWhenDocLib() throws IOException, JSONException {
        String docLibId = docLibRef.getId();
        JSONObject docLibResult = execute(docLibId);
        assertEquals(SITE_ONE, docLibResult.getString("name"));
    }

    public void testGetDocLibRefWhenDocLib() throws IOException, JSONException {
        String docLibId = docLibRef.getId();
        JSONObject docLibResult = execute(docLibId);
        assertEquals(docLibRef.toString(), docLibResult.getString("nodeRef"));
    }

    public void testGetFolder() throws IOException, JSONException {
        String folderId = folderRef.getId();
        JSONObject folderResult = execute(folderId);
        assertEquals(FOLDER_TEST, folderResult.getString("name"));
        String folderRefStr = folderRef.toString();
        assertEquals(folderRefStr, folderResult.getString("nodeRef"));
    }

    public void testGetUserHomeAsRootNode() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            userHome = nodeBean.getUserHome();
            return null;
        }, USER_ONE);
        String userHomeId = userHome.getId();
        JSONObject userResult = execute(userHomeId);
        assertEquals(OpenDeskModel.NODE_PICKER_MY_DOCS, userResult.getString("rootName"));
        assertTrue(userResult.has("children"));
    }

    public void testGet3Children() throws IOException, JSONException {
        String docLibId = docLibRef.getId();
        JSONObject docLibResult = execute(docLibId);
        assertEquals(1, docLibResult.getJSONArray("children").length());

        AuthenticationUtil.runAs(() -> {
            uploadFile(docLibRef, FILE_TEST_UPLOAD, FILE_TEST_TEMPLATE1);
            createFolder(docLibRef, FOLDER_TEST2);
            return null;
        }, ADMIN);
        JSONObject docLibResultAfter = execute(docLibId);
        assertEquals(3, docLibResultAfter.getJSONArray("children").length());
    }

    private JSONObject execute(String nodeId) throws IOException, JSONException {
        String uri = "nodepicker/node/" + nodeId;
        return executeGetObject(uri, USER_ONE);
    }
}
