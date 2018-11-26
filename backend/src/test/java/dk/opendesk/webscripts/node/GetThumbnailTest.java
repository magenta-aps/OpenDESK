package dk.opendesk.webscripts.node;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.version.Version;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class GetThumbnailTest extends OpenDeskWebScriptTest {

    private String docId;
    private String versionId;

    public GetThumbnailTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        NodeRef nodeRef = sites.get(SITE_ONE);
        NodeRef docRef = uploadFile(nodeRef, FILE_TEST_UPLOAD);
        docId = docRef.getId();
        Map<String, Serializable> versionProperties = new HashMap<>();
        Version version = createVersion(docRef, versionProperties);
        versionId = version.getFrozenStateNodeRef().getId();
    }

    public void testCreateThumbnail() throws IOException, JSONException {
        String uri = "/node/" + docId + "/thumbnail/" + versionId;
        JSONObject returnJSON = executeGetObject(uri);
        assertTrue(returnJSON.has(NODE_REF));
    }
}
