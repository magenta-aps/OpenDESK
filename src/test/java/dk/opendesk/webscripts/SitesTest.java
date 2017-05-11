package dk.opendesk.webscripts;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
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

public class SitesTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(NotificationsTest.class);

    private MutableAuthenticationService authenticationService = (MutableAuthenticationService) getServer().getApplicationContext().getBean(
            "authenticationService");

    private PersonService personService = (PersonService) getServer().getApplicationContext().getBean("personService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");



    private static final String newTestSite = "newTestSite";
    private static final String newTestSite2 = "newTestSite2";
    private static final String newTestSite3 = "newTestSite3";
    private static final String newTestSite4 = "newTestSite4";

    public SitesTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        TestUtils.createSite(transactionService, siteService, newTestSite);
        TestUtils.createSite(transactionService, siteService, newTestSite2);
        TestUtils.createSite(transactionService, siteService, newTestSite3);
        TestUtils.createSite(transactionService, siteService, newTestSite4);
    }

//    @Test
//    public void testGetSite()  throws IOException, JSONException{
//        log.debug("NotificationsTest.testGetSite");
//        JSONArray returnJSON;
//
//            returnJSON = executeWebScriptGetSite(newTestSite);
//
//            assertEquals(newTestSite, returnJSON.getJSONObject(0).get("shortName"));
//
//
//    }

    @Test
    public void testGetAll() throws IOException, JSONException {
        log.debug("NotificationsTest.testGetAll");
        JSONArray returnJSON;


            returnJSON = executeWebScriptGetAll("");
        System.out.println(returnJSON);

            //assertEquals(newTestSite, returnJSON.getJSONObject(0).get("shortName"));


    }







   /** webscripts **/

    private JSONArray executeWebScript (JSONObject data) throws IOException, JSONException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest("/sites", data.toString(), "application/json");
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    private JSONArray executeWebScriptGetSite (String siteName) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getSite");
        data.put("PARAM_SITE_SHORT_NAME", siteName);
        return executeWebScript(data);
    }

    private JSONArray executeWebScriptGetAll (String query) throws IOException, JSONException {
        JSONObject data = new JSONObject();
        data.put("PARAM_METHOD", "getAll");
        data.put("PARAM_QUERY", query);
        return executeWebScript(data);
    }





    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

//        TestUtils.deleteSite(transactionService, siteService, newTestSite);
        TestUtils.deletePerson(transactionService, personService, TestUtils.USER_ONE);
    }
}