// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.node;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

public class GetChildrenTest extends OpenDeskWebScriptTest {

    private NodeRef docLibRef;
    private NodeRef docLibRef2;

    public GetChildrenTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        // SITES
        sites.put(SITE_TWO, null);
    }

    @Override
    protected void setUpTest() {
        docLibRef = siteBean.getDocumentLibraryRef(SITE_ONE);
        docLibRef2 = siteBean.getDocumentLibraryRef(SITE_TWO);
    }

    public void testGet3DocumentsAnd1Folder() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            uploadFile(docLibRef, FILE_TEST_TEMPLATE1);
            uploadFile(docLibRef, FILE_TEST_TEMPLATE2);
            uploadFile(docLibRef, FILE_TEST_TEMPLATE3);
            createFolder(docLibRef, FOLDER_TEST);
            return null;
        }, ADMIN);
        String nodeId = docLibRef.getId();
        JSONArray returnJSON = execute(nodeId);
        assertDocumentChildren(returnJSON, 3);
        assertFolderChildren(returnJSON, 1);
        assertLinkChildren(returnJSON, 0);
    }

    public void testGet2DocumentsAnd2Folder() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            uploadFile(docLibRef2, FILE_TEST_TEMPLATE1);
            uploadFile(docLibRef2, FILE_TEST_TEMPLATE2);
            createFolder(docLibRef2, FOLDER_TEST);
            createFolder(docLibRef2, FOLDER_TEST);
            return null;
        }, ADMIN);
        String nodeId = docLibRef2.getId();
        JSONArray returnJSON = execute(nodeId);
        assertDocumentChildren(returnJSON, 2);
        assertFolderChildren(returnJSON, 2);
        assertLinkChildren(returnJSON, 0);
    }

    private void assertDocumentChildren(JSONArray returnJSON, int childrenCount) throws JSONException {
        assertChildrenCount(returnJSON, childrenCount, TYPE_DOCUMENT);
    }

    private void assertFolderChildren(JSONArray returnJSON, int childrenCount) throws JSONException {
        assertChildrenCount(returnJSON, childrenCount, TYPE_FOLDER);
    }

    private void assertLinkChildren(JSONArray returnJSON, int childrenCount) throws JSONException {
        assertChildrenCount(returnJSON, childrenCount, TYPE_LINK);
    }

    private void assertChildrenCount(JSONArray returnJSON, int childrenCount, int type) throws JSONException {
        assertEquals(childrenCount, returnJSON.getJSONArray(type).length());
    }

    private JSONArray execute(String nodeId) throws IOException, JSONException {
        String uri = "node/" + nodeId + "/children";
        return executeGetArray(uri, USER_ONE);
    }
}
