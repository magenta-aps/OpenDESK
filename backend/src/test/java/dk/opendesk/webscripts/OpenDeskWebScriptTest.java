//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

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
import org.alfresco.service.cmr.preference.PreferenceService;
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
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.context.ApplicationContext;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.File;
import java.io.IOException;
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
    public static final String TITLE = "title";
    public static final String DISPLAY_NAME = "displayName";
    public static final String DESCRIPTION = "description";
    public static final String VISIBILITY = "visibility";
    public static final String ROLE = "role";
    public static final String CHILDREN = "children";
    public static final String ADMIN = "admin";
    public static final int TYPE_DOCUMENT = 0;
    public static final int TYPE_FOLDER = 1;
    public static final int TYPE_LINK = 2;
    public static final String FILE_NAME = "fileName";

    public static final String USER_ONE = "user_one";
    public static final String USER_TWO = "user_two";
    public static final String USER_THREE = "user_three";
    public static final String USER_FOUR = "user_four";
    public static final String USER_FIVE = "user_five";
    public static final String USER_EXT = "user_ext";
    public static final String USER_EXT_FIRSTNAME = "user";
    public static final String USER_EXT_LASTNAME = "ext";
    public static final String USER_EXT_EMAIL = "user_ext@testtest.dk";
    public static final String USER_EXT_TELEPHONE = "12345678";
    public static final String USER_EXT_GROUP = "Site" + OpenDeskModel.COLLABORATOR;

    public static final String SITE_ONE = "reserved_for_test_site_one";
    public static final String SITE_ONE_DESC = "This is a fine desc";
    public static final String SITE_TWO = "reserved_for_test_site_two";
    public static final String SITE_THREE = "reserved_for_test_site_three";
    public static final String SITE_FOUR = "reserved_for_test_site_four";
    public static final String SITE_FIVE = "reserved_for_test_site_five";
    public static final String PD_SITE_ONE = "reserved_for_test_pd_site_one";

    public static final String SITE_NAME = "Reserved for test site";

    public static final String FILE_TEST_UPLOAD = "Test_Upload.pdf";
    public static final String FILE_TEST_TEMPLATE1 = "Test_Template1.pdf";
    public static final String FILE_TEST_TEMPLATE2 = "Test_Template2.pdf";
    public static final String FILE_TEST_TEMPLATE3 = "Test_Template3.pdf";
    public static final String FILE_TEST_TEMPLATE4 = "Test_Template4.pdf";
    public static final String FILE_TEST_FROM_TEMPLATE1 = "Test_From_Template1.pdf";
    public static final String FILE_TEST_TEMPLATE1_WITHOUT_EXT = "Test_Template1";
    public static final String FILE_TEST_TEMPLATE1_NEXT = "Test_Template1(1).pdf";
    public static final String FOLDER_TEST = "Folder Test";
    public static final String FOLDER_TEST2 = "Folder Test2";

    public ApplicationContext appContext = getServer().getApplicationContext();

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) appContext.getBean("nodeArchiveService");
    protected NodeService nodeService = (NodeService) appContext.getBean("nodeService");
    private PersonService personService = (PersonService) appContext.getBean("personService");
    protected SiteService siteService = (SiteService) appContext.getBean("siteService");
    private TransactionService transactionService = (TransactionService) appContext.getBean("transactionService");
    private AuthorityService authorityService = (AuthorityService) appContext.getBean("authorityService");


    private PreferenceService preferenceService = (PreferenceService) getServer().getApplicationContext().getBean("preferenceService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private VersionService versionService = (VersionService) getServer().getApplicationContext().getBean("versionService");

    protected NodeBean nodeBean = (NodeBean) appContext.getBean("nodeBean");
    private PDSiteBean pdSiteBean = (PDSiteBean) appContext.getBean("pdSiteBean");
    private PersonBean personBean = (PersonBean) appContext.getBean("personBean");
    private SettingsBean settingsBean = (SettingsBean) appContext.getBean("settingsBean");
    protected SiteBean siteBean = (SiteBean) appContext.getBean("siteBean");

    public List<String> users = new ArrayList<>();
    public Map<String, NodeRef> sites = new HashMap<>();

    protected void AddUsersAndSites() {}
    protected void setUpTest() throws FileNotFoundException, JSONException {}
    protected void tearDownTest() {}

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        AuthenticationUtil.runAs(() -> {
            // USERS
            users.add(USER_ONE);

            // SITES
            sites.put(SITE_ONE, null);

            AddUsersAndSites();

            for (String userName : users) {
                createUser(userName);
            }

            for (Map.Entry<String, NodeRef> site : sites.entrySet()) {
                NodeRef nodeRef = createSite(site.getKey());
                site.setValue(nodeRef);
            }
            setUpTest();
            return null;
        }, ADMIN);
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
            tearDownTest();
            nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
            return null;
        }, ADMIN);
    }

    protected String executeDelete(String uri) throws IOException {
        return executeDelete(uri, USER_ONE);
    }

    protected String executeDelete(String uri, String userName) throws IOException {
        TestWebScriptServer.Request request = new TestWebScriptServer.DeleteRequest(uri);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        return response.getContentAsString();
    }

    protected String executeGet(String uri) throws IOException {
        return executeGet(uri, USER_ONE);
    }

    protected String executeGet(String uri, String userName) throws IOException {
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(uri);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        return response.getContentAsString();
    }

    protected JSONArray executeGetArray(String uri) throws IOException, JSONException {
        return new JSONArray(executeGet(uri));
    }

    protected JSONArray executeGetArray(String uri, String userName) throws IOException, JSONException {
        return new JSONArray(executeGet(uri, userName));
    }

    protected JSONObject executeGetObject(String uri) throws IOException, JSONException {
        return new JSONObject(executeGet(uri));
    }

    protected JSONObject executeGetObject(String uri, String userName) throws IOException, JSONException {
        return new JSONObject(executeGet(uri, userName));
    }

    protected String executePost(String uri, JSONObject data, String userName) throws IOException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PostRequest(uri, data.toString(), MimetypeMap.MIMETYPE_JSON);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        return response.getContentAsString();
    }

    protected String executePost(String uri, String userName) throws IOException {
        return executePost(uri, new JSONObject(), userName);
    }

    protected String executePost(String uri) throws IOException {
        return executePost(uri, USER_ONE);
    }

    protected String executePost(String uri, JSONObject data) throws IOException {
        return executePost(uri, data, USER_ONE);
    }

    protected JSONObject executePostObject(String uri, JSONObject data) throws IOException, JSONException {
        return new JSONObject(executePost(uri, data));
    }

    protected JSONObject executePostObject(String uri, JSONObject data, String userName) throws IOException, JSONException {
        return new JSONObject(executePost(uri, data, userName));
    }

    protected String executePut(String uri) throws IOException {
        return executePut(uri, new JSONObject());
    }

    protected String executePut(String uri, JSONObject data, String userName) throws IOException {
        TestWebScriptServer.Request request = new TestWebScriptServer.PutRequest(uri, data.toString(), MimetypeMap.MIMETYPE_JSON);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, userName);
        return response.getContentAsString();
    }

    protected String executePut(String uri, JSONObject data) throws IOException {
        return executePut(uri, data, USER_ONE);
    }

    protected JSONObject executePutObject(String uri, JSONObject data) throws IOException, JSONException {
        return new JSONObject(executePut(uri, data));
    }

    protected JSONObject executePutObject(String uri, JSONObject data, String userName) throws IOException, JSONException {
        return new JSONObject(executePut(uri, data, userName));
    }

    protected Boolean addLink(String siteShortName, String targetSiteShortName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            siteBean.addLink(siteShortName, targetSiteShortName);
            return true;
        });
    }

    public boolean createUser(String userName) {
        return createUser(userName, "firstName", "lastName");
    }

    public boolean createUser(String userName, String firstName, String lastName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            Map<QName, Serializable> personProperties = personBean.createPersonProperties(userName,
                    firstName, lastName,"email@email.com", "12234861");
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
                                USER_ONE, ADMIN, "PRIVATE", ""));
    }

    private NodeRef createSiteWithAspect(String siteShortName, QName aspect) {
        NodeRef nodeRef = createSite(siteShortName, SiteVisibility.PUBLIC);
        Map<QName, Serializable> aspectProps = new HashMap<>();
        addAspect(nodeRef, aspect, aspectProps);
        return nodeRef;
    }

    public NodeRef createSite(String siteShortName){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                createSite(siteShortName, SiteVisibility.PUBLIC));
    }

    public NodeRef createPrivateSite(String siteShortName){
        return transactionService.getRetryingTransactionHelper().doInTransaction(() ->
                createSite(siteShortName, SiteVisibility.PRIVATE));
    }

    private NodeRef createSite(String name, SiteVisibility siteVisibility) {
        return siteBean.createSite(name, "Small description", siteVisibility);
    }

    public NodeRef uploadFile(NodeRef parent, String resourceFilename, String alfrescoFilename) {

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            File file = new File("src/test/resources/" + resourceFilename);

            FileInfo fileInfo = fileFolderService.create(parent, alfrescoFilename, ContentModel.PROP_CONTENT);
            NodeRef node = fileInfo.getNodeRef();

            ContentWriter writer = contentService.getWriter(node, ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
            writer.setEncoding("UTF-8");
            writer.putContent(file);
            return node;
        });
    }

    public NodeRef createTemplateFolder(String foldername) throws FileNotFoundException {
        NodeRef templateFolderRef = getFolderTemplateRef();
        return createFolder(templateFolderRef, foldername);
    }

    public NodeRef uploadTemplateFile(String filename) throws FileNotFoundException {
        NodeRef templateDocLibRef = getDocumentTemplateRef();
        return uploadFile(templateDocLibRef, FILE_TEST_UPLOAD,filename);
    }

    public Boolean deleteNode(NodeRef nodeRef) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            nodeService.deleteNode(nodeRef);
            return true;
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

    public Boolean addMemberToSite(String siteShortName, String authority, String group) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
        siteBean.addMember(siteShortName, authority, group);
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

    public NodeRef createFolder(NodeRef parentRef, String folderName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            Map<QName, Serializable> properties = new HashMap<>();
            properties.put(ContentModel.PROP_NAME, folderName);
            ChildAssociationRef child = nodeService.createNode(parentRef, ContentModel.ASSOC_CONTAINS,
                    ContentModel.ASSOC_CONTAINS, ContentModel.TYPE_FOLDER, properties);
            return child.getChildRef();
        });
    }

    public NodeRef getDocumentTemplateRef() throws FileNotFoundException {
        return nodeBean.getNodeByPath(OpenDeskModel.PATH_NODE_TEMPLATES);
    }

    public NodeRef getFolderTemplateRef() throws FileNotFoundException {
        return nodeBean.getNodeByPath(OpenDeskModel.PATH_SPACE_TEMPLATES);
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

    public Serializable getProperty(String siteShortName, QName qName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            SiteInfo siteInfo = siteService.getSite(siteShortName);
            NodeRef nodeRef = siteInfo.getNodeRef();
            return nodeService.getProperty(nodeRef, qName);
        });
    }

    public void setPreferences(String userName, HashMap<String, Serializable> preferences) {
        transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            preferenceService.setPreferences(userName, preferences);
            return true;
        });
    }
}
