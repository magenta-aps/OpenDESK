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
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import javax.swing.text.html.parser.ContentModel;
import java.io.IOException;

public class GetPerson extends OpenDeskWebScript {

    private PersonBean personBean;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    private NodeService nodeService;

    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String userName = urlParams.get("userName");

            objectResult = personBean.getPersonInfo(userName);
            if (objectResult == null) {
                notFound(res);
            }
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}

