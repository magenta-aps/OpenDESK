package dk.opendesk.webscripts;

import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import javax.transaction.UserTransaction;
import java.io.IOException;

public class UsersTest extends BaseWebScriptTest {

    static Logger log = Logger.getLogger(UsersTest.class);

    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");

    private static final String ADMIN_USER_NAME = "admin";
    private static final String WEBSCRIPT_URL = "/users";
    private static final String WEBSCRIPT_CONTENT_TYPE = "application/json";

    private static final String USER_ONE = "user_one";
    private static final String USER_ONE_FIRSTNAME = "user";
    private static final String USER_ONE_LASTNAME = "one";
    private static final String USER_ONE_EMAIL = "user_one@testtest.dk";
    private static final String USER_ONE_GROUP = "Collaborator";
    private static final String USER_ONE_SITE = "user_one_site";
    private static final String USERNAME = "userName";

    public UsersTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        UserTransaction tx = null;
        try {
            tx = transactionService.getUserTransaction();
            tx.begin();

            siteService.createSite("site-dashboard", USER_ONE_SITE, USER_ONE_SITE, "desc", SiteVisibility.PUBLIC);

            tx.commit();
        } catch (Throwable err) {
            try {
                if (tx != null) {
                    tx.rollback();
                }
            } catch (Exception tex) {
            }
        }
    }

    @Test
    public void testUsersWebscript() {
        log.debug("UsersTest.testUsersWebscript");

        try {
            JSONObject data = new JSONObject();
            data.put("PARAM_METHOD", "createExternalUser");
            data.put("PARAM_SITE_SHORT_NAME", USER_ONE_SITE);
            data.put("PARAM_FIRSTNAME", USER_ONE_FIRSTNAME);
            data.put("PARAM_LASTNAME", USER_ONE_LASTNAME);
            data.put("PARAM_EMAIL", USER_ONE_EMAIL);
            data.put("PARAM_GROUP_NAME", USER_ONE_GROUP);

            TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest(WEBSCRIPT_URL, data.toString(), WEBSCRIPT_CONTENT_TYPE);
            TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, ADMIN_USER_NAME);
            JSONObject returnJSON = new JSONArray(response.getContentAsString()).getJSONObject(0);

            assertTrue(returnJSON.has(USERNAME));
            assertEquals(USER_ONE, returnJSON.getString(USERNAME));

        } catch (IOException ex) {
            log.error("IOException", ex);
        } catch (JSONException ex) {
            log.error("JSONException", ex);
        }
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        personService.deletePerson(USER_ONE);
    }
}