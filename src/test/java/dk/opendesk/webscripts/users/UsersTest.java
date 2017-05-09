package dk.opendesk.webscripts.users;

import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;

public class UsersTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(UsersTest.class);

    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private static final String USERNAME = "userName";

    public UsersTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        TestUtils.createSite(transactionService, siteService, TestUtils.USER_ONE_SITE_FOUR);
    }

    // createExternalUser
    @Test
    public void testCreateOneExternalUser() {
        log.debug("UsersTest.createsOneExternalUser");

        try {
            JSONObject data = new JSONObject();
            data.put("PARAM_METHOD", "createExternalUser");
            data.put("PARAM_SITE_SHORT_NAME", TestUtils.USER_ONE_SITE_FOUR);
            data.put("PARAM_FIRSTNAME", TestUtils.USER_ONE_FIRSTNAME);
            data.put("PARAM_LASTNAME", TestUtils.USER_ONE_LASTNAME);
            data.put("PARAM_EMAIL", TestUtils.USER_ONE_EMAIL);
            data.put("PARAM_GROUP_NAME", TestUtils.USER_ONE_GROUP);

            JSONObject returnJSON = executeWebScript(data);

            assertTrue(returnJSON.has(USERNAME));
            assertEquals(TestUtils.USER_ONE, returnJSON.getString(USERNAME));

            // Tear Down
            TestUtils.deletePerson(transactionService, personService, TestUtils.USER_ONE);

        } catch (IOException ex) {
            log.error("IOException", ex);
        } catch (JSONException ex) {
            log.error("JSONException", ex);
        }
    }

    private JSONObject executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/users", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString()).getJSONObject(0);
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
    }
}