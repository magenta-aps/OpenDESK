// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.settings;

import dk.opendesk.repo.beans.SettingsBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.namespace.QName;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class UpdateSettings extends OpenDeskWebScript {

    private SettingsBean settingsBean;

    public void setSettingsBean(SettingsBean settingsBean) { this.settingsBean = settingsBean; }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            Map<QName, Serializable> properties = getContentMap("properties");
            settingsBean.updateSettings(properties);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
