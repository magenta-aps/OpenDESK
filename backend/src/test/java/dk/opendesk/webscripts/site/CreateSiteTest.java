// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class CreateSiteTest extends OpenDeskWebScriptTest {

    public CreateSiteTest() {
        super();
    }

    public void testCreateSite()  throws IOException, JSONException {
        String siteDisplayName = SITE_ONE;
        String description = SITE_ONE_DESC;
        String siteVisibility = "PUBLIC";
        JSONObject data = new JSONObject();
        data.put(DISPLAY_NAME, siteDisplayName);
        data.put(DESCRIPTION, description);
        data.put(VISIBILITY, siteVisibility);
        String uri = "/site";
        JSONObject returnJSON = executePostObject(uri, data);
        assertEquals(siteDisplayName, returnJSON.get(TITLE));
        assertEquals(description, returnJSON.get(DESCRIPTION));
        assertEquals(siteVisibility, returnJSON.get(VISIBILITY));
    }
}
