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
import org.json.simple.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class AddSiteLinkTest extends OpenDeskWebScriptTest {

    public AddSiteLinkTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        createSite(SITE_TWO);
    }

    public void testAddSiteLink() throws IOException, JSONException {
        String siteShortName = SITE_ONE;
        String uri = "/site/" + siteShortName + "/siteLink";
        JSONObject data = new JSONObject();
        data.put("destinationShortName", SITE_TWO);
        executePost(uri, data, ADMIN);
        AuthenticationUtil.runAs(() -> {
            NodeRef documentLibraryRef = siteBean.getDocumentLibraryRef(siteShortName);
            JSONArray nodeInfos = nodeBean.getChildrenInfo(documentLibraryRef);
            JSONArray linkNodes = (JSONArray)nodeInfos.get(TYPE_LINK);
            assertEquals(1, linkNodes.size());
            return null;
        }, ADMIN);
    }
}
