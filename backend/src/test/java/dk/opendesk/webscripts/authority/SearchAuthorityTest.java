package dk.opendesk.webscripts.authority;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;

public class SearchAuthorityTest extends OpenDeskWebScriptTest {

    public SearchAuthorityTest() {
        super();
    }

    public void testGetUserOneFromUserName() throws IOException {
        executeWebScript();
        // We can't assert anything based on searches through Solr.
        // We just assert that the endpoint is present.
    }

    private void executeWebScript () throws IOException {
        String uri = "/authority/search?filter=" + USER_TWO;
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(uri);
        sendRequest(request, Status.STATUS_OK, ADMIN);
    }
}
