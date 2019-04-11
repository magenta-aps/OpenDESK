// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.editors;

import dk.opendesk.repo.beans.EditorBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetEditors extends OpenDeskWebScript {

    private EditorBean editorBean;

    public void setEditorBean(EditorBean editorBean) {
        this.editorBean = editorBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {

            AuthenticationUtil.pushAuthentication();
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            objectResult = editorBean.getEditorObjects();

            AuthenticationUtil.popAuthentication();


        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
