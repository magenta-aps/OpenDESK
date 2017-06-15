package dk.opendesk.repo.utils;

import java.io.IOException;
import java.io.OutputStream;
import java.io.Serializable;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.executer.MailActionExecuter;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.i18n.MessageService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import static org.alfresco.model.ContentModel.*;
import static org.alfresco.service.namespace.NamespaceService.CONTENT_MODEL_1_0_URI;

public class Utils {

    /*
        Setup permissions
        Consumer - can read content
        Contributor - can create and upload content
        Editor - can read and update content
        Collaborator - can do everything except moving and deleting other users content
        Coordinator - full access
    */

    public static final Map<String, JSONArray> siteGroups = Collections.unmodifiableMap(
            new HashMap<String, JSONArray>() {
                {
                    put(OpenDeskModel.project, createSiteGroups(OpenDeskModel.project));
                    put(OpenDeskModel.pd_project, createSiteGroups(OpenDeskModel.pd_project));
                }});

    private static JSONArray createSiteGroups(String siteType) {
        JSONArray result = new JSONArray();

        switch (siteType) {
            case OpenDeskModel.pd_project:
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_PROJECTOWNER, OpenDeskModel.SITE_COLLABORATOR, false, false));
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_PROJECTMANAGER, OpenDeskModel.SITE_MANAGER, false, false));
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_PROJECTGROUP, OpenDeskModel.SITE_COLLABORATOR, true, true));
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_WORKGROUP, OpenDeskModel.SITE_COLLABORATOR, true, true));
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_MONITORS, OpenDeskModel.SITE_CONSUMER, true, true));
                result.add(createSiteGroup(OpenDeskModel.PD_GROUP_STEERING_GROUP, OpenDeskModel.SITE_CONSUMER, true, true));
                break;
            case OpenDeskModel.project:
                result.add(createSiteGroup(OpenDeskModel.SITE_MANAGER, null, false, true));
                result.add(createSiteGroup(OpenDeskModel.SITE_COLLABORATOR, null, false, true));
                result.add(createSiteGroup(OpenDeskModel.SITE_CONTRIBUTOR, null, false, true));
                result.add(createSiteGroup(OpenDeskModel.SITE_CONSUMER, null, false, true));
                break;
        }
        return result;
    }

    private static JSONObject createSiteGroup(String shortName, String authority, Boolean collapsed, Boolean multipleMembers){
        JSONObject json = new JSONObject();
        try {
            json.put("shortName", shortName);
            json.put("authority", authority);
            json.put("collapsed", collapsed);
            json.put("multipleMembers", multipleMembers);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return json;
    }

    private static Map<String, String> PD_GROUPS = new HashMap<>();

    public static String getPDGroupTranslation(String group)
    {
        if(PD_GROUPS.isEmpty()) {
            PD_GROUPS.put("PD_PROJECTOWNER", "Projektejere");
            PD_GROUPS.put("PD_PROJECTMANAGER", "Projektledere");
            PD_GROUPS.put("PD_PROJECTGROUP", "Projektgruppe");
            PD_GROUPS.put("PD_WORKGROUP", "Arbejdsgruppe");
            PD_GROUPS.put("PD_MONITORS", "Følgegruppe");
            PD_GROUPS.put("PD_STEERING_GROUP", "Styregruppe");
        }
        return PD_GROUPS.get(group);
    }

    /**
     * Alfresco's (or Java's) query string parsing doesn't handle UTF-8
     * encoded values. We parse the query string ourselves here.
     * @param url
     * @return
     */
    public static Map<String, String> parseParameters(String url) {
        // Do our own parsing to get the query string since java.net.URI can't
        // handle some URIs
        int queryStringStart = url.indexOf('?');
        String queryString = "";
        if (queryStringStart != -1) {
            queryString = url.substring(queryStringStart+1);
        }
        Map<String, String> parameters = URLEncodedUtils
                .parse(queryString, Charset.forName("UTF-8"))
                .stream()
                .collect(
                        Collectors.groupingBy(
                                NameValuePair::getName,
                                Collectors.collectingAndThen(Collectors.toList(), Utils::paramValuesToString)));
        return parameters;
    }

    private static String paramValuesToString(List<NameValuePair> paramValues) {
        if (paramValues.size() == 1) {
            return paramValues.get(0).getValue();
        }
        List<String> values = paramValues.stream().map(NameValuePair::getValue).collect(Collectors.toList());
        return "[" + StringUtils.join(values, ",") + "]";
    }

    public static String getJSONObject(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getString(parameter).length() == 0)
        {
            return "";
        }
        return json.getString(parameter);
    }

    public static NodeRef getNodeRef(JSONObject json) throws JSONException {
        String storeType = getJSONObject(json, "PARAM_STORE_TYPE");
        String storeId = getJSONObject(json, "PARAM_STORE_ID");
        String nodeId = getJSONObject(json, "PARAM_NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            return new NodeRef(storeType, storeId, nodeId);
        }
        return null;
    }

    public static JSONArray getJSONSuccess () {
        return getJSONReturnPair("status", "success");
    }

    public static JSONArray getJSONError (Exception e) {
        Map<String, Serializable> map = new HashMap<>();
        map.put("error", e.getStackTrace()[0].toString());
        return getJSONReturnArray(map);
    }

    public static JSONArray getJSONReturnPair (String key, String value) {
        Map<String, Serializable> map = new HashMap<>();
        map.put(key, value);
        return getJSONReturnArray(map);
    }

    public static JSONArray getJSONReturnArray(Map<String, Serializable> map) {
        JSONObject return_json = new JSONObject();
        JSONArray result = new JSONArray();
        try {
            for (Map.Entry<String, Serializable> pair : map.entrySet())
                return_json.put(pair.getKey(), pair.getValue().toString());
            result.add(return_json);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public static JSONObject getJSONReturnObject(Map<String, Serializable> map) {
        JSONObject result = new JSONObject();
        try {
            for (Map.Entry<String, Serializable> pair : map.entrySet())
                result.put(pair.getKey(), pair.getValue().toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public static void writeJSONArray (Writer writer, JSONArray result) {
        try {
            result.writeJSONString(writer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getGroupPermission (AuthorityService authorityService, Set<AccessPermission> permissions,
                                             String group) {

        for (AccessPermission a : permissions) {
            String authority = a.getAuthority();
            if(group.equals(authority))
                return a.getPermission();
        }

        // If the group is a sub group of standard alfresco groups then we need to fetch the parent group to get permissions
        Set<String> parentGroups = authorityService.getContainingAuthorities(AuthorityType.GROUP, group, true);
        if(parentGroups.size() > 0) {
            String parentGroup = parentGroups.iterator().next();
            return getGroupPermission(authorityService, permissions, parentGroup);
        }
        return null;
    }

    public static String getAuthorityName (String siteShortName, String groupName)
    {
        String siteGroup = "GROUP_site_" + siteShortName;
        if("".equals(groupName))
            return siteGroup;
        else
            return siteGroup + "_" + groupName;
    }

    public static NodeRef createSite(NodeService nodeService, ContentService contentService,  SiteService siteService,
                                     String displayName, String description, SiteVisibility siteVisibility) {

        String shortName = displayName.replaceAll(" ", "-");
        String shortNameWithVersion = shortName;
        SiteInfo site = null;

        // Iterate through possible short names for the new site until a vacant is found
        int i = 1;
        do {
            try {
                // Create site
                site = siteService.createSite("site-dashboard", shortNameWithVersion, displayName, description,
                        siteVisibility);
                NodeRef n = site.getNodeRef();

                // Create containers like document library and discussions
                createContainer(siteService, shortNameWithVersion, OpenDeskModel.DOC_LIBRARY);
                createContainer(siteService, shortNameWithVersion, OpenDeskModel.DISCUSSIONS);

                // Create site dashboard
                createSiteDashboard(nodeService, contentService, n, shortNameWithVersion);
            }
            catch(SiteServiceException e) {
                if(e.getMsgId().equals("site_service.unable_to_create"))
                    shortNameWithVersion = shortName + "-" + ++i;
            }
        }
        while(site == null);

        return site.getNodeRef();
    }

    private static NodeRef createContainer(SiteService siteService, String shortName, String componentId) {
        return siteService.createContainer(shortName, componentId, ContentModel.TYPE_FOLDER, null);
    }

    private static NodeRef createChildNode(NodeService nodeService, NodeRef n, String name, QName type) {
        Map<QName, Serializable> props = new HashMap<>();
        props.put(ContentModel.PROP_NAME, name);

        return nodeService.createNode(n, ContentModel.ASSOC_CONTAINS,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name),
                type, props).getChildRef();
    }

    private static void createSiteDashboard(NodeService nodeService, ContentService contentService,
                                            NodeRef siteNodeRef, String siteShortName) {

        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
        try {
            docBuilder = docBuilderFactory.newDocumentBuilder();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
            return;
        }

        // Create surf-config folder
        NodeRef surfConfigRef = createChildNode(nodeService, siteNodeRef, "surf-config", ContentModel.TYPE_FOLDER);
        Map<QName, Serializable> aspectProps = new HashMap<>();
        nodeService.addAspect(surfConfigRef, ContentModel.ASPECT_HIDDEN, aspectProps);

        // Create components folder
        NodeRef componentsRef = createChildNode(nodeService, surfConfigRef, "components", ContentModel.TYPE_FOLDER);
        
        Map<String, String> components = new HashMap<>();
        components.put("title", "title/collaboration-title");
        components.put("navigation", "navigation/collaboration-navigation");
        components.put("component-1-1", "dashlets/docsummary");
        components.put("component-1-2", "dashlets/forum-summary");
        components.put("component-2-1", "dashlets/colleagues");
        components.put("component-2-2", "dashlets/activityfeed");

        for (Map.Entry<String, String> component : components.entrySet()) {
            Document doc = createComponentXML(docBuilder, siteShortName, component.getKey(), component.getValue(), "");
            String name = "page." + component.getKey() + ".site~" + siteShortName + "~dashboard";
            createXMLFile(nodeService, contentService, componentsRef, name, doc);
        }

        // Create pages folder
        NodeRef pagesRef = createChildNode(nodeService, surfConfigRef, "pages", ContentModel.TYPE_FOLDER);
        NodeRef siteRef = createChildNode(nodeService, pagesRef, "site", ContentModel.TYPE_FOLDER);
        NodeRef siteShortNameRef = createChildNode(nodeService, siteRef, siteShortName, ContentModel.TYPE_FOLDER);

        Document dashboardDoc = createPageXML(docBuilder);
        createXMLFile(nodeService, contentService, siteShortNameRef, "dashboard", dashboardDoc);
    }

    private static Document createComponentXML(DocumentBuilder docBuilder, String siteShortName, String region_id,
                                               String url, String height) {
        Document doc = docBuilder.newDocument();
        Element rootElement = doc.createElement("component");
        doc.appendChild(rootElement);

        addXMLChild(doc, rootElement, "guid", "page." + region_id + ".site~" + siteShortName + "~dashboard");
        addXMLChild(doc, rootElement, "scope", "page");
        addXMLChild(doc, rootElement, "region-id", region_id);
        addXMLChild(doc, rootElement, "source-id", "site/" + siteShortName + "/dashboard");
        addXMLChild(doc, rootElement, "url", "/components/" + url);

        if(!"".equals(height)) {
            Element propertiesElement = doc.createElement("properties");
            doc.appendChild(propertiesElement);

            addXMLChild(doc, propertiesElement, "height", height);
        }

        return doc;
    }

    private static Document createPageXML(DocumentBuilder docBuilder) {
        Document doc = docBuilder.newDocument();
        Element rootElement = doc.createElement("page");
        doc.appendChild(rootElement);

        addXMLChild(doc, rootElement, "title", "Collaboration Site Dashboard");
        addXMLChild(doc, rootElement, "title-id", "page.siteDashboard.title");
        addXMLChild(doc, rootElement, "description", "Collaboration site's dashboard page");
        addXMLChild(doc, rootElement, "description-id", "page.siteDashboard.description");
        addXMLChild(doc, rootElement, "authentication", "user");
        addXMLChild(doc, rootElement, "template-instance", "dashboard-2-columns-wide-right");

        Element propertiesElement = doc.createElement("properties");
        rootElement.appendChild(propertiesElement);

        String pageDocLib = "{\"pageId\":\"documentlibrary\"}";
        String pageDiscussions = "{\"pageId\":\"discussions-topiclist\"}";
        addXMLChild(doc, propertiesElement, "sitePages", "[" + pageDocLib + "," + pageDiscussions + "]");

        return doc;
    }

    private static void addXMLChild(Document doc, Element parent, String name, String textContent) {
        Element e = doc.createElement(name);
        e.setTextContent(textContent);
        parent.appendChild(e);
    }

    private static void createXMLFile(NodeService nodeService, ContentService contentService, NodeRef parent,
                                      String fileName, Document xmlDoc) {
        fileName += ".xml";

        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(PROP_NAME, fileName);
        NodeRef n = nodeService.createNode(parent, ASSOC_CONTAINS,
                QName.createQName(CONTENT_MODEL_1_0_URI, fileName), TYPE_CONTENT, properties).getChildRef();

        ContentWriter contentWriter = contentService.getWriter(n, ContentModel.PROP_CONTENT, true);
        contentWriter.setMimetype(MimetypeMap.MIMETYPE_XML);
        OutputStream s = contentWriter.getContentOutputStream();

        // Write to new preset file
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = null;
        try {
            transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            StreamResult result = new StreamResult(s);
            DOMSource source = new DOMSource(xmlDoc);
            transformer.transform(source, result);
            s.close();
        } catch (IOException | TransformerException e) {
            e.printStackTrace();
        }
    }

    public static Map<QName, Serializable> createPersonProperties(String userName, String firstName, String lastName,
                                                                  String email) {
        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(ContentModel.PROP_USERNAME, userName);
        properties.put(ContentModel.PROP_FIRSTNAME, firstName);
        properties.put(ContentModel.PROP_LASTNAME, lastName);
        properties.put(ContentModel.PROP_EMAIL, email);
        return properties;
    }

    public static String generateNewPassword()
    {
        PasswordGenerator passwordGenerator = new PasswordGenerator.PasswordGeneratorBuilder()
                .useDigits(true)
                .useLower(true)
                .useUpper(true)
                .build();
        return passwordGenerator.generate(8); // output ex.: lrU12fmM 75iwI90o
    }

    public static SiteVisibility getVisibility(String visibilityStr)
    {
        if(visibilityStr.isEmpty())
            return null;
        else
            return SiteVisibility.valueOf(visibilityStr);
    }

    public static void sendEmail(ActionService actionService, SearchService searchService, String templatePath,
                                 String subject, String to, String from, Map<String, Serializable> templateArgs){
        Action mailAction = actionService.createAction(MailActionExecuter.NAME);
        mailAction.setParameterValue(MailActionExecuter.PARAM_SUBJECT, subject);
        mailAction.setParameterValue(MailActionExecuter.PARAM_TO, to);
        mailAction.setParameterValue(MailActionExecuter.PARAM_FROM, from);
        mailAction.setParameterValue(MailActionExecuter.PARAM_TEXT, "Test body");

        // Get Template
        String templateRootPath = "/app:company_home/app:dictionary/app:email_templates/";
        String templateQuery = "PATH:\"" + templateRootPath + templatePath + "\"";
        ResultSet resultSet = searchService.query(new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore"),
                SearchService.LANGUAGE_LUCENE, templateQuery);

        if (resultSet.length()==0){
            return;
        }

        NodeRef template = resultSet.getNodeRef(0);
        mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE, template);

        // Define parameters for the model (set fields in the ftl like : args.workflowTitle)
        Map<String, Serializable> templateModel = new HashMap<String, Serializable>();
        templateModel.put("args",(Serializable)templateArgs);

        mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE_MODEL,(Serializable)templateModel);

        actionService.executeAction(mailAction, null);
    }

    public static void sendInviteUserEmail(MessageService messageService, ActionService actionService,
                                           SearchService searchService, Properties properties, String to,
                                           Map<String, Serializable> templateArgs){

        String subject = messageService.getMessage("opendesk.templates.invite_user_email.subject");
        String from = properties.getProperty("mail.from.default");
        String templatePath = "cm:OpenDesk/cm:user-invite-email.html.ftl";

        sendEmail(actionService, searchService, templatePath, subject, to, from, templateArgs);
    }

    public static String getFileName (NodeService nodeService, NodeRef nodeRef, String nodeName) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        String dotSplit = "\\.";
        String bracketSplit = "\\(";

        int currentHighest = 0;
        String[] nodeNameParts = nodeName.split(dotSplit);
        String name = nodeNameParts[0];
        String ext = "";
        if(nodeNameParts.length > 1)
            ext = "." + nodeNameParts[1];

        boolean match = false;

        for (ChildAssociationRef child : childAssociationRefs) {

            String file = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_NAME);
            String splitter = file.contains("(") ? bracketSplit : dotSplit;
            String file_name = file.split(splitter)[0];

            if (file_name.trim().equals(name.trim())) {
                match = true;
                Matcher m = Pattern.compile("\\((.d?)\\)").matcher(file);

                int number = 0;
                while (m.find())
                    number = Integer.valueOf(m.group(1));

                if (number > currentHighest)
                    currentHighest = number;
            }
        }

        if (match) {
            currentHighest++;
            return name + "(" + currentHighest + ")" + ext;
        }
        return nodeName;
    }

    public static JSONObject convertUserToJSON (NodeService nodeService, PreferenceService preferenceService,
                                                NodeRef person) throws JSONException {
        JSONObject json = new JSONObject();

        String userName = (String) nodeService.getProperty(person, ContentModel.PROP_USERNAME);
        json.put("userName", userName);

        String firstName = (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME);
        json.put("firstName", firstName);

        String lastName = (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME);
        json.put("lastName", lastName);

        String displayName = (firstName + " " + lastName).trim();
        json.put("displayName", displayName);

        String email = (String) nodeService.getProperty(person, ContentModel.PROP_EMAIL);
        json.put("email", email);

        String telephone = (String) nodeService.getProperty(person, ContentModel.PROP_TELEPHONE);
        json.put("telephone", telephone);

        String mobile = (String) nodeService.getProperty(person, ContentModel.PROP_MOBILE);
        json.put("mobile", mobile);

        String jobTitle = (String) nodeService.getProperty(person, ContentModel.PROP_JOBTITLE);
        json.put("jobTitle", jobTitle);

        String organization = (String) nodeService.getProperty(person, ContentModel.PROP_ORGANIZATION);
        json.put("organization", organization);

        List<AssociationRef> assocRefs = nodeService.getTargetAssocs(person,ContentModel.ASSOC_AVATAR);
        if(assocRefs.size() > 0) {
            NodeRef avatarNodeRef = assocRefs.get(0).getTargetRef();
            String avatar = "api/node/workspace/SpacesStore/" + avatarNodeRef.getId() + "/content";
            json.put("avatar", avatar);
        }

        Map<String, Serializable> preferences = getPreferences(preferenceService, userName, "");
        json.put("preferences", Utils.getJSONReturnObject(preferences));

        return json;
    }

    public static JSONObject convertNotificationToJSON (NodeService nodeService, SiteService siteService,
                                                        PersonService personService, NodeRef notification) throws JSONException {
        JSONObject json = new JSONObject();

        Map<QName, Serializable> props = nodeService.getProperties(notification);

        String subject = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_SUBJECT);
        String message = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_MESSAGE);
        Boolean read = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_READ);
        Boolean seen = (Boolean) props.get(OpenDeskModel.PROP_NOTIFICATION_SEEN);
        String link = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_LINK);
        String type = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_TYPE);
        String shortName = (String) props.get(OpenDeskModel.PROP_NOTIFICATION_PROJECT);
        String projectName = "";

        // project contains the shortName, we want the display name
        if (shortName != null) {
            SiteInfo site = siteService.getSite(shortName);
            if (site != null) {
                projectName = siteService.getSite(shortName).getTitle();
            }
        }

        String creatorUserName = (String) nodeService.getProperty(notification, ContentModel.PROP_CREATOR);
        NodeRef creator = personService.getPerson(creatorUserName);

        String firstName = (String) nodeService.getProperty(creator, ContentModel.PROP_FIRSTNAME);
        String lastName = (String) nodeService.getProperty(creator, ContentModel.PROP_LASTNAME);
        String fromName = (firstName + " " + lastName).trim();

        String fileName = "";

        if (OpenDeskModel.PD_NOTIFICATION_REVIEW_REQUEST.equals(type) || OpenDeskModel.PD_NOTIFICATION_REVIEW_APPROVED.equals(type) ||
                OpenDeskModel.PD_NOTIFICATION_REJECTED.equals(type) || OpenDeskModel.PD_NOTIFICATION_NEWDOC.equals(type)) {

            NodeRef document = new NodeRef("workspace://SpacesStore/" + link.replace("#!/dokument/", "").split("\\?")[0]);

            String symbol = link.contains("?") ? "&" : "?";

            link = link + symbol + "NID=" + notification; // add this to the link, makes it easy to lookup the notification from the ui

            if(nodeService.exists(document))
                fileName = (String) nodeService.getProperty(document, ContentModel.PROP_NAME);
        }

        json.put("nodeRef", notification);
        json.put("subject", subject);
        json.put("message", message);
        json.put("link", link);
        json.put("read", read);
        json.put("seen", seen);
        json.put("filename", fileName);
        json.put("project", projectName);
        json.put("from", fromName);
        json.put("type", type);

        Date d = (Date) nodeService.getProperty(notification, ContentModel.PROP_CREATED);
        json.put("created", d.getTime());

        return json;
    }

    public static Map<String, Serializable> getPreferences(PreferenceService preferenceService, String userName, String filter) {
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...
            return preferenceService.getPreferences(userName, filter);
        }
        finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    public static String getSiteType(NodeService nodeService, NodeRef nodeRef) {
        String type = OpenDeskModel.project;
        if (nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_PD)) {
            type = OpenDeskModel.pd_project;
        }
        return type;
    }
}