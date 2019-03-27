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
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class GetNextAvailableNameTest extends OpenDeskWebScriptTest {

    private NodeRef docLib;
    private String folderId;
    private String fileName = FILE_TEST_TEMPLATE1;

    @Override
    protected void setUpTest() {
        docLib = siteBean.getDocumentLibraryRef(SITE_ONE);
        folderId = docLib.getId();
    }

    public void testGetNextAvailableNameTest() throws IOException, JSONException {
        String uri = "/node/" + folderId + "/next-available-name/" + fileName;
        JSONObject returnJSON = executeGetObject(uri);
        assertTrue(returnJSON.has(FILE_NAME));
        assertEquals(fileName, returnJSON.getString(FILE_NAME));
    }

    public void testGetNextAvailableNameTestWithSameFileName() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            uploadFile(docLib, fileName);
            return null;
        }, ADMIN);
        String uri = "/node/" + folderId + "/next-available-name/" + fileName;
        JSONObject returnJSON = executeGetObject(uri);
        assertTrue(returnJSON.has(FILE_NAME));
        assertEquals(FILE_TEST_TEMPLATE1_NEXT, returnJSON.getString(FILE_NAME));
    }
}
