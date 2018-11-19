package dk.opendesk.webscripts;

import dk.opendesk.repo.beans.*;
import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.springframework.context.ApplicationContext;

import java.io.File;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class OpenDeskWebScriptTest extends BaseWebScriptTest {

    public static final String STATUS = "status";
    public static final String SUCCESS = "success";
    public static final String NODE_REF = "nodeRef";
    public static final String FILENAME = "fileName";
    public static final String SHORTNAME = "shortName";
    public static final String MEMBERS = "members";
    public static final String ADMIN = "admin";

    public static final String USER_ONE = "user_one";
    public static final String USER_ONE_FIRSTNAME = "user";
    public static final String USER_ONE_LASTNAME = "one";
    public static final String USER_ONE_EMAIL = "user_one@testtest.dk";
    public static final String USER_ONE_GROUP = "Site" + OpenDeskModel.COLLABORATOR;
    public static final String USER_TWO = "user_two";
    public static final String USER_THREE = "user_three";
    public static final String USER_FOUR = "user_four";
    public static final String USER_FIVE = "user_five";

    public static final String SITE_ONE = "reserved_for_test_site_one";
    public static final String SITE_ONE_DESC = "This is a fine desc";
    public static final String SITE_TWO = "reserved_for_test_site_two";
    public static final String SITE_THREE = "reserved_for_test_site_three";
    public static final String SITE_FOUR = "reserved_for_test_site_four";
    public static final String SITE_FIVE = "reserved_for_test_site_five";

    public static final String SITE_NAME = "Reserved for test site";

    public static final String FILE_TEST_UPLOAD = "Test_Upload.pdf";
    public static final String FILE_TEST_TEMPLATE1 = "Test_Template1.pdf";
    public static final String FILE_TEST_TEMPLATE2 = "Test_Template2.pdf";
    public static final String FILE_TEST_TEMPLATE3 = "Test_Template3.pdf";
    public static final String FILE_TEST_TEMPLATE4 = "Test_Template4.pdf";
    public static final String FILE_TEST_FROM_TEMPLATE1 = "Test_From_Template1.pdf";
    public static final String FILE_TEST_TEMPLATE1_WITHOUT_EXT = "Test_Template1";

    public Logger log = Logger.getLogger(OpenDeskWebScriptTest.class);
    public ApplicationContext appContext = getServer().getApplicationContext();

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) appContext.getBean("nodeArchiveService");
    private NodeService nodeService = (NodeService) appContext.getBean("nodeService");
    private PersonService personService = (PersonService) appContext.getBean("personService");
    private SiteService siteService = (SiteService) appContext.getBean("siteService");
    private TransactionService transactionService = (TransactionService) appContext.getBean("transactionService");
    private AuthorityService authorityService = (AuthorityService) appContext.getBean("authorityService");


    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private VersionService versionService = (VersionService) getServer().getApplicationContext().getBean("versionService");

    private NodeBean nodeBean = (NodeBean) appContext.getBean("nodeBean");
    private PDSiteBean pdSiteBean = (PDSiteBean) appContext.getBean("pdSiteBean");
    private PersonBean personBean = (PersonBean) appContext.getBean("personBean");
    private SettingsBean settingsBean = (SettingsBean) appContext.getBean("settingsBean");
    private SiteBean siteBean = (SiteBean) appContext.getBean("siteBean");

    public List<String> users = new ArrayList<>();
    public Map<String, SiteInfo> sites = new HashMap<>();

    protected void setUpTest() {}
    protected void tearDownTest() {}

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        AuthenticationUtil.runAs(() -> {
            // USERS
            users.add(TestUtils.USER_ONE);

            // SITES
            sites.put(TestUtils.SITE_ONE, null);

            setUpTest();

            for (String userName : users) {
                createUser(userName);
            }

            for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
                SiteInfo siteInfo = createSite(site.getKey());
                site.setValue(siteInfo);
            }
            return null;
        }, AuthenticationUtil.getAdminUserName());
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();
        AuthenticationUtil.runAs(() -> {

            // Delete users
            for (String userName : users) {
                deletePerson(userName);
            }

            // Delete sites
            for (String siteShortName : sites.keySet()) {
                deleteSite(siteShortName);
            }
            nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
            tearDownTest();
            return null;
        }, AuthenticationUtil.getAdminUserName());
    }

    public boolean createUser(String userName) {

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            Map<QName, Serializable> personProperties = personBean.createPersonProperties(userName,
                    "firstName", "lastName","email@email.com", "12234861");
            personBean.createPerson(personProperties);
            return true;
        });
    }

    public JSONObject createSiteTemplate(String displayName){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                        siteBean.createTemplate(displayName, "Small description"));
    }

    public JSONObject createPDSite(String name){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                        pdSiteBean.createPDSite(name, "Small description", "145", "575",
                                USER_ONE, USER_TWO, "PRIVATE", ""));
    }

    private SiteInfo createSiteWithAspect(String siteShortName, QName aspect) {
        SiteInfo s = createSite(siteShortName, SiteVisibility.PUBLIC);
        Map<QName, Serializable> aspectProps = new HashMap<>();
        TestUtils.addAspect(transactionService, nodeService, s.getNodeRef(), aspect,
                aspectProps);
        return s;
    }

    public SiteInfo createSite(String siteShortName){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                createSite(siteShortName, SiteVisibility.PUBLIC));
    }

    public SiteInfo createPrivateSite(String siteShortName){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                createSite(siteShortName, SiteVisibility.PRIVATE));
    }

    private SiteInfo createSite(String name, SiteVisibility siteVisibility) {
        NodeRef nodeRef = siteBean.createSite(name, "Small description", siteVisibility);
        return siteService.getSite(nodeRef);
    }

    public NodeRef uploadFile(NodeRef parent, String filename) {

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            File file = new File("src/test/resources/Test_Upload.pdf");

            FileInfo fileInfo = fileFolderService.create(parent, filename, ContentModel.PROP_CONTENT);
            NodeRef node = fileInfo.getNodeRef();

            ContentWriter writer = contentService.getWriter(node, ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
            writer.setEncoding("UTF-8");
            writer.putContent(file);
            return node;
        });
    }

    public Boolean deleteSite(String siteShortName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            if(siteService.hasSite(siteShortName))
                siteBean.deleteSite(siteShortName);
            return true;
        });
    }

    public Boolean deletePerson(String userName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            personService.deletePerson(userName);
            return true;
        });
    }

    public Boolean addToAuthority(String group, String userName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            authorityService.addAuthority(group, userName);
            return true;
        });
    }

    public Version createVersion(NodeRef docRef, Map<String, Serializable> versionProperties) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                versionService.createVersion(docRef, versionProperties));
    }

    public Boolean addAspect(NodeRef nodeRef, QName aspect, Map<QName, Serializable> aspectProperties) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            nodeService.addAspect(nodeRef, aspect, aspectProperties);
            return true;
        });
    }

    public String getIdFromNodeRefStr(String nodeRefStr) {
        return nodeRefStr.split("/")[3];
    }

    public ChildAssociationRef createFolder(NodeRef parent, String folderName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                nodeService.createNode(parent, ContentModel.ASSOC_CONTAINS, QName.createQName(folderName),
                        ContentModel.TYPE_FOLDER));
    }

    public NodeRef getDocumentTemplateRef()
            throws FileNotFoundException {
        return nodeBean.getNodeByPath(OpenDeskModel.PATH_NODE_TEMPLATES);
    }

    private NodeRef getSettings() throws FileNotFoundException {
        return settingsBean.getSettingsFolder();
    }

    public void updateSettings(Map<QName, Serializable> properties) {
        transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            settingsBean.updateSettings(properties);
            return true;
        });
    }
}
