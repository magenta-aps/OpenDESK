// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.person;

import dk.opendesk.repo.beans.PersonBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class ValidatePerson extends OpenDeskWebScript {

    private PersonBean personBean;

    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = getContentString("userName");
            String email = getContentString("email");
            objectResult = personBean.validatePerson(userName, email);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
