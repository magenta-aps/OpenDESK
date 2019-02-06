// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;

import java.io.IOException;

public class AddMemberTest extends OpenDeskWebScriptTest {

    public AddMemberTest() {
        super();
    }

    public void testAddMember() throws IOException {
        String siteShortName = SITE_ONE;
        String userName = USER_ONE;
        String groupName = OpenDeskModel.SITE_CONSUMER;
        String uri = "/site/" + siteShortName +"/group/" + groupName + "/member/" + userName;
        executePost(uri, ADMIN);
        AuthenticationUtil.runAs(() -> {
            boolean isMember = siteService.isMember(siteShortName, userName);
            assertTrue(isMember);
            return null;
        }, ADMIN);
    }
}
