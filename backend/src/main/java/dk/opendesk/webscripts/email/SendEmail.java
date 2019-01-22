// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.email;

import dk.opendesk.repo.beans.EmailBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class SendEmail extends OpenDeskWebScript {

    private EmailBean emailBean;

    public void setEmailBean(EmailBean emailBean) {
        this.emailBean = emailBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = getContentString("userName");
            String subject = getContentString("subject");
            String body = getContentString("body");
            emailBean.sendEmail(userName, subject, body);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
