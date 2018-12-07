// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.pdSite;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class CreatePDSiteTest extends OpenDeskWebScriptTest {

    public CreatePDSiteTest() {
        super();
    }

    @Override
    protected void tearDownTest() {
        deleteSite(PD_SITE_ONE);
    }

    public void testCreatePDSITE()  throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("title", PD_SITE_ONE);
        data.put("description", SITE_ONE_DESC);
        data.put("sbsys", "123");
        data.put("centerId", "C-TEST");
        data.put("owner", USER_ONE);
        data.put("manager", ADMIN);
        data.put("visibility", "PUBLIC");
        data.put("templateName", "");
        String uri = "/pd-site";
        JSONObject returnJSON = executePostObject(uri, data);
        assertTrue(returnJSON.has(NODE_REF));
        assertTrue(returnJSON.has(SHORTNAME));
    }
}
