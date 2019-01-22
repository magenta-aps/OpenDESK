// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.service.cmr.site.SiteInfo;

import java.io.IOException;

public class DeleteSiteTest extends OpenDeskWebScriptTest {

    public DeleteSiteTest() {
        super();
    }

    public void testDeleteSite()  throws IOException {
        String siteShortName = SITE_ONE;
        String uri = "/site/" + siteShortName;
        executeDelete(uri, ADMIN);
        SiteInfo siteInfo = siteService.getSite(siteShortName);
        assertNull(siteInfo);
    }
}
