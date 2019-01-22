// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.override;

import org.alfresco.repo.web.auth.AuthenticationListener;
import org.alfresco.repo.web.scripts.servlet.RemoteUserAuthenticatorFactory;
import org.springframework.extensions.webscripts.Authenticator;
import org.springframework.extensions.webscripts.Description;
import org.springframework.extensions.webscripts.servlet.WebScriptServletRequest;
import org.springframework.extensions.webscripts.servlet.WebScriptServletResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CustomRemoteUserAuthenticatorFactory extends RemoteUserAuthenticatorFactory {

    @Override
    public Authenticator create(WebScriptServletRequest req, WebScriptServletResponse res) {
        return new CustomBasicHttpAuthenticator(req, res, this.listener);
    }

    public class CustomBasicHttpAuthenticator extends RemoteUserAuthenticator {
        public CustomBasicHttpAuthenticator(WebScriptServletRequest req, WebScriptServletResponse res, AuthenticationListener listener) {
            super(req, res, listener);
        }

        @Override
        public boolean authenticate(Description.RequiredAuthentication required, boolean isGuest) {
            boolean authenticate = super.authenticate(required, isGuest);
            HttpServletResponse res = this.servletRes.getHttpServletResponse();
            // Change the WWW-Authenticate header value to something else than Basic to avoid force login prompts
            if(!authenticate && !isAdminPage())
                res.setHeader("WWW-Authenticate", "BasicX realm=\"Alfresco\"");
            return authenticate;
        }

        private boolean isAdminPage() {
            HttpServletRequest req = this.servletReq.getHttpServletRequest();
            String url = req.getRequestURL().toString();
            return url.endsWith("alfresco/s/admin") || url.endsWith("alfresco/s/index");
        }
    }
}
