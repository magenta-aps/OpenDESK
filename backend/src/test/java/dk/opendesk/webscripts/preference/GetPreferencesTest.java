// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.preference;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;

public class GetPreferencesTest extends OpenDeskWebScriptTest {

    private static final String PREFERENCE = "dk.magenta.sites.receiveNotifications";
    private static final String PREFERENCE_VALUE = "true";

    public GetPreferencesTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        HashMap<String, Serializable> preferences = new HashMap<>();
        preferences.put(PREFERENCE, PREFERENCE_VALUE);
        setPreferences(USER_ONE, preferences);
    }

    public void testGetPreferenceForReceivingNotifications() throws JSONException, IOException {
        String uri = "/preferences?pf=" + PREFERENCE;
        JSONArray returnJSON = executeGetArray(uri);
        assertTrue(returnJSON.length() > 0);
        assertEquals(PREFERENCE_VALUE, returnJSON.getJSONObject(0).getString(PREFERENCE));
    }
}
