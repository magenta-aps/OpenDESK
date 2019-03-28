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
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class GetVersionsTest extends OpenDeskWebScriptTest {

    private NodeRef docRef;
    private Map<String, Serializable> versionProperties = new HashMap<>();

    public GetVersionsTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        docRef = uploadFile(sites.get(SITE_ONE), FILE_TEST_UPLOAD, FILE_TEST_UPLOAD);
        createVersion(docRef, versionProperties);
        createVersion(docRef, versionProperties);
        createVersion(docRef, versionProperties);
        createVersion(docRef, versionProperties);
    }

    public void testGet4Versions() throws IOException, JSONException {
        // The initial createVersion adds the first version and a version history. See docs.
        assertWebScript(docRef.getId(), 4);
    }

    public void testGet10Versions() throws IOException, JSONException {
        // The initial createVersion adds the first version and a version history. See docs.
        AuthenticationUtil.runAs(() -> {
            Map<String, Serializable> versionProperties = new HashMap<>();
            createVersion(docRef, versionProperties);
            createVersion(docRef, versionProperties);
            createVersion(docRef, versionProperties);
            createVersion(docRef, versionProperties);
            createVersion(docRef, versionProperties);
            createVersion(docRef, versionProperties);
            return null;
        }, ADMIN);
        assertWebScript(docRef.getId(), 10);
    }

    private void assertWebScript(String nodeId, int versionCount) throws IOException, JSONException {
        String uri = "node/" + nodeId + "/versions";
        JSONArray returnJSON = executeGetArray(uri);
        assertEquals(versionCount, returnJSON.length());
    }
}
