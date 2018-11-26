package dk.opendesk.webscripts.template;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

public class GetDocumentTemplatesTest extends OpenDeskWebScriptTest {

    public GetDocumentTemplatesTest() {
        super();
    }

    public void testGetDocumentTemplates() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            uploadTemplateFile(FILE_TEST_TEMPLATE1);
            uploadTemplateFile(FILE_TEST_TEMPLATE2);
            uploadTemplateFile(FILE_TEST_TEMPLATE3);
            return null;
        }, ADMIN);
        assertTemplateCount(3);

        AuthenticationUtil.runAs(() -> {
            uploadTemplateFile(FILE_TEST_TEMPLATE4);
            return null;
        }, ADMIN);
        assertTemplateCount(4);
    }

    private void assertTemplateCount(int templateCount) throws IOException, JSONException {
        String uri = "/templates/document";
        JSONArray returnJSON = executeGetArray(uri);
        assertEquals(templateCount, returnJSON.length());
    }
}
