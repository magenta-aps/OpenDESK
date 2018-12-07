// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.node;

import dk.opendesk.repo.beans.NodeBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.util.ArrayList;


public class PreProcessMove extends OpenDeskWebScript {

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            ArrayList<String> nodeRefStrs = getContentParamArray("nodeRefs");
            ArrayList<NodeRef> nodeRefs = new ArrayList<>();
            for (String nodeRefStr : nodeRefStrs)
                nodeRefs.add(new NodeRef(nodeRefStr));

            String destinationRefStr = getContentString("destinationRef");
            NodeRef destinationRef = new NodeRef(destinationRefStr);

            nodeBean.preProcessMove(nodeRefs, destinationRef);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}
