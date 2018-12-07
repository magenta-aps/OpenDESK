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

public class CreateTemplateTest extends OpenDeskWebScriptTest {
    String templateShortName;

    public CreateTemplateTest() {
        super();
    }

    public void testCreateTemplate()  throws IOException, JSONException {
        String siteShortName = SITE_ONE;
        String description = SITE_ONE_DESC;
        JSONObject data = new JSONObject();
        data.put(DESCRIPTION, description);
        String uri = "/site/" + siteShortName + "/template";
        JSONObject returnJSON = executePostObject(uri, data);
        assertTrue(returnJSON.has(SHORTNAME));
        assertTrue(returnJSON.has(DESCRIPTION));
        templateShortName = returnJSON.getString(SHORTNAME);
    }

    @Override
    protected void tearDownTest() {
        deleteSite(templateShortName);
    }
}
