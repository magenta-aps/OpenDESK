// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.preference;

import dk.opendesk.repo.beans.PreferenceBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

public class GetPreferences extends OpenDeskWebScript {

    private PreferenceBean preferenceBean;

    public void setPreferenceBean(PreferenceBean preferenceBean) {
        this.preferenceBean = preferenceBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String username = AuthenticationUtil.getFullyAuthenticatedUser();
            String pf = urlQueryParams.get("pf");
            Map<String, Serializable> preferences = preferenceBean.getPreferences(username, pf);
            arrayResult = getJSONReturnArray(preferences);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
