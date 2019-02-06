// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class SettingsTest extends OpenDeskWebScriptTest {

    private static final String PUBLIC_SETTING = "appName";
    private static final String PUBLIC_SETTING_VALUE = "OpenDesk";
    private static final String PUBLIC_SETTING_NEW_VALUE = "Test OpenDesk";
    private static final String PRIVATE_SETTING = "enableProjects";
    private static final boolean PRIVATE_SETTING_VALUE = false;
    private static final boolean PRIVATE_SETTING_NEW_VALUE = true;

    public SettingsTest() {
        super();
    }

    @Override
    protected void setUpTest() throws JSONException {
        JSONObject settings = new JSONObject();
        settings.put(PRIVATE_SETTING, PRIVATE_SETTING_VALUE);
        JSONObject publicSettings = new JSONObject();
        publicSettings.put(PUBLIC_SETTING, PUBLIC_SETTING_VALUE);
        settings.put("public", publicSettings);
        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(OpenDeskModel.PROP_SETTINGS, settings.toString());
        updateSettings(properties);
    }

    public void testGetPublicSettings() throws JSONException, IOException {
        String uri = "/settings/public";
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(PUBLIC_SETTING_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }

    public void testGetSettings() throws JSONException, IOException {
        String uri = "/settings";
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(PRIVATE_SETTING_VALUE, returnJSON.getBoolean(PRIVATE_SETTING));
        assertEquals(PUBLIC_SETTING_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }

    public void testUpdateSettings() throws JSONException, IOException {
        JSONObject data = new JSONObject();
        JSONObject properties = new JSONObject();
        JSONObject settings = new JSONObject();
        settings.put(PRIVATE_SETTING, PRIVATE_SETTING_NEW_VALUE);
        JSONObject publicSettings = new JSONObject();
        publicSettings.put(PUBLIC_SETTING, PUBLIC_SETTING_NEW_VALUE);
        settings.put("public", publicSettings);
        properties.put("settings", settings);
        data.put("properties", properties);
        String uri = "/settings";
        executePut(uri, data, ADMIN);
        JSONObject returnJSON = executeGetObject(uri);
        assertEquals(PRIVATE_SETTING_NEW_VALUE, returnJSON.getBoolean(PRIVATE_SETTING));
        assertEquals(PUBLIC_SETTING_NEW_VALUE, returnJSON.getJSONObject("public").getString(PUBLIC_SETTING));
    }
}
