// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.authority;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;

import java.io.IOException;

public class SearchAuthorityTest extends OpenDeskWebScriptTest {

    public SearchAuthorityTest() {
        super();
    }

    public void testGetUserOneFromUserName() throws IOException, JSONException {
        String uri = "/authority/search?filter=" + USER_TWO;
        executeGetArray(uri);
        // We can't assert anything based on searches through Solr.
        // We just assert that the endpoint is present.
    }
}
