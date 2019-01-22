// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.template;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

public class CreateNodeTest extends OpenDeskWebScriptTest {

    private NodeRef docTemplateRef;
    private NodeRef docTemplateWithoutExtensionRef;
    private NodeRef docLibRef;

    public CreateNodeTest() {
        super();
    }

    @Override
    protected void setUpTest() throws FileNotFoundException {
        NodeRef templateDocLib = getDocumentTemplateRef();
        docTemplateRef = uploadFile(templateDocLib, FILE_TEST_FROM_TEMPLATE1);
        docTemplateWithoutExtensionRef = uploadFile(templateDocLib, FILE_TEST_TEMPLATE1_WITHOUT_EXT);
        docLibRef = siteBean.getDocumentLibraryRef(SITE_ONE);
        addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
    }

    public void testCreateContentFromTemplate() throws IOException, JSONException {
        assertWebScript(FILE_TEST_FROM_TEMPLATE1, docTemplateRef, docLibRef);
    }

    public void testCreateContentFromTemplateWithoutExtension() throws IOException, JSONException {
        assertWebScript(FILE_TEST_TEMPLATE1_WITHOUT_EXT, docTemplateWithoutExtensionRef, docLibRef);
    }

    private void assertWebScript(String nodeName, NodeRef templateNodeRef, NodeRef destinationNodeRef)
            throws IOException, JSONException {
        List<ChildAssociationRef> childAssocs = nodeService.getChildAssocs(destinationNodeRef);
        int countBefore = childAssocs.size();
        execute(nodeName, templateNodeRef, destinationNodeRef);
        List<ChildAssociationRef> childAssocsAfter = nodeService.getChildAssocs(destinationNodeRef);
        int countAfter = childAssocsAfter.size();
        assertEquals(countBefore + 1, countAfter);
    }

    private void execute(String nodeName, NodeRef templateNodeRef, NodeRef destinationNodeRef)
            throws IOException, JSONException {
        String uri = "/template/" + templateNodeRef.getId();
        JSONObject data = new JSONObject();
        data.put("name", nodeName);
        data.put("destinationNodeRef", destinationNodeRef.toString());
        executePost(uri, data);
    }

    @Override
    protected void tearDownTest() {
        deleteNode(docTemplateRef);
        deleteNode(docTemplateWithoutExtensionRef);
    }
}
