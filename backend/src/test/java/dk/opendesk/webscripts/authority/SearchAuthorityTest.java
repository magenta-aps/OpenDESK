package dk.opendesk.webscripts.authority;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.json.JSONException;

import java.io.IOException;

public class SearchAuthorityTest extends OpenDeskWebScriptTest {

    public SearchAuthorityTest() {
        super();
    }

    public void testGetUserOneFromUserName() throws IOException, JSONException {
        String uri = "/authority/search?filter=" + USER_TWO;
        executeGetArray(uri);
        // We can't assert anything based on searches through Solr.
        // We just assert that the endpoint is present.
    }
}
