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

public class GetSiteTest extends OpenDeskWebScriptTest {

    public GetSiteTest() {
        super();
    }

    public void testGetSite()  throws IOException, JSONException {
        String siteShortName = SITE_ONE;
        String uri = "/site/" + siteShortName;
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(siteShortName, returnJSON.get(SHORTNAME));
    }
}
