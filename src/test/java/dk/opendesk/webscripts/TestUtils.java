package dk.opendesk.webscripts;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.transaction.RetryingTransactionHelper;
import org.alfresco.rest.api.tests.client.data.Site;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.transaction.TransactionService;
import org.alfresco.util.PropertyMap;

import javax.transaction.UserTransaction;

public class TestUtils {

    public static final String STATUS = "status";
    public static final String SUCCESS = "success";
    public static final String ADMIN = "admin";

    public static final String USER_ONE = "user_one";
    public static final String USER_ONE_FIRSTNAME = "user";
    public static final String USER_ONE_LASTNAME = "one";
    public static final String USER_ONE_EMAIL = "user_one@testtest.dk";
    public static final String USER_ONE_GROUP = "Collaborator";
    public static final String USER_ONE_SITE_ONE = "user_one_site_one";
    public static final String USER_ONE_SITE_TWO = "user_one_site_two";
    public static final String USER_ONE_SITE_THREE = "user_one_site_three";
    public static final String USER_ONE_SITE_FOUR = "user_one_site_four";
    public static final String USER_TWO = "user_two";
    public static final String USER_THREE = "user_three";

    public static NodeRef createUser(TransactionService transactionService, PersonService personService,
                                  MutableAuthenticationService authenticationService, String userName) {
        UserTransaction tx = null;
        NodeRef n = null;
        try {
            tx = transactionService.getUserTransaction();
            tx.begin();
            if (!authenticationService.authenticationExists(userName)) {
                authenticationService.createAuthentication(userName, "PWD".toCharArray());

                PropertyMap ppOne = new PropertyMap(4);
                ppOne.put(ContentModel.PROP_USERNAME, userName);
                ppOne.put(ContentModel.PROP_FIRSTNAME, "firstName");
                ppOne.put(ContentModel.PROP_LASTNAME, "lastName");
                ppOne.put(ContentModel.PROP_EMAIL, "email@email.com");
                ppOne.put(ContentModel.PROP_JOBTITLE, "jobTitle");

                n = personService.createPerson(ppOne);
            }
            tx.commit();
        } catch (Throwable err) {
            try {
                if (tx != null) {
                    tx.rollback();
                }
            } catch (Exception tex) {
            }
        }
        return n;
    }

    public static SiteInfo createSite(TransactionService transactionService, SiteService siteService, String siteShortName){
        UserTransaction tx = null;
        SiteInfo s = null;
        try {
            tx = transactionService.getUserTransaction();
            tx.begin();
            s = siteService.createSite("site-dashboard", siteShortName, siteShortName, "desc", SiteVisibility.PUBLIC);
            tx.commit();
        } catch (Throwable err) {
            try {
                if (tx != null) {
                    tx.rollback();
                }
            } catch (Exception tex) {
            }
        }
        return s;
    }

    public static Boolean deleteSite(TransactionService transactionService, SiteService siteService, String siteShortName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            siteService.deleteSite(siteShortName);
            return true;
        });
    }

    public static Boolean deletePerson(TransactionService transactionService, PersonService personService, String userName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            personService.deletePerson(userName);
            return true;
        });
    }
}
