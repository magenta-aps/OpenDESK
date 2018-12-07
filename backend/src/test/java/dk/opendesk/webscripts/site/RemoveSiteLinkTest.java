// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;

import java.io.IOException;

public class RemoveSiteLinkTest extends OpenDeskWebScriptTest {

    private String siteShortName = SITE_ONE;
    private String targetSiteShortName = SITE_TWO;

    public RemoveSiteLinkTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        sites.put(targetSiteShortName, null);
    }

    @Override
    protected void setUpTest() {
        addLink(siteShortName, targetSiteShortName);
    }

    public void testRemoveSiteLink() throws IOException {
        String uri = "/site/" + siteShortName +"/siteLink/" + targetSiteShortName;
        executeDelete(uri, ADMIN);
        AuthenticationUtil.runAs(() -> {
            NodeRef link = siteBean.getLink(siteShortName, targetSiteShortName);
            assertNull(link);
            return null;
        }, ADMIN);
    }
}
