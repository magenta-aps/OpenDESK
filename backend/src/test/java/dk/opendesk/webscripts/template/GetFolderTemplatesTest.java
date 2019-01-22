// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.template;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

public class GetFolderTemplatesTest extends OpenDeskWebScriptTest {

    public GetFolderTemplatesTest() {
        super();
    }

    public void testGetFolderTemplates() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            createTemplateFolder(FILE_TEST_TEMPLATE1);
            createTemplateFolder(FILE_TEST_TEMPLATE2);
            createTemplateFolder(FILE_TEST_TEMPLATE3);
            return null;
        }, ADMIN);
        // Per default Alfresco already contains one template folder
        assertTemplateCount(4);

        AuthenticationUtil.runAs(() -> {
            createTemplateFolder(FILE_TEST_TEMPLATE4);
            return null;
        }, ADMIN);
        // Per default Alfresco already contains one template folder
        assertTemplateCount(5);
    }

    private void assertTemplateCount(int templateCount) throws IOException, JSONException {
        String uri = "/templates/folder";
        JSONArray returnJSON = executeGetArray(uri);
        assertEquals(templateCount, returnJSON.length());
    }
}
