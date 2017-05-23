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
import org.alfresco.repo.action.evaluator.HasTagEvaluator;
import org.alfresco.repo.action.executer.MailActionExecuter;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.i18n.MessageService;
import org.alfresco.repo.search.SearcherException;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.i18n.MessageLookup;
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
import org.springframework.extensions.surf.util.I18NUtil;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.print.Doc;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import static org.alfresco.model.ContentModel.*;
import static org.alfresco.service.namespace.NamespaceService.CONTENT_MODEL_1_0_URI;


/**
 * Created by syastrov on 8/26/14.
 */
public class Utils {

    private static final String ROLE_NAME_MESSAGE_PREFIX = "role.";

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
        map.put("error", e.toString());
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

    public static void writeJSONArray (Writer writer, JSONArray result) {
        try {
            result.writeJSONString(writer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getGroupUserRole (AuthorityService authorityService, Set<AccessPermission> permissions, String group) {

        for (AccessPermission a : permissions) {
            if(a.getAuthority().equals(PermissionService.ALL_AUTHORITIES))
                continue;

            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.GROUP, a.getAuthority(), true);
            if (authorities.contains(group)) {
                return a.getPermission();
            }
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

    // NOTICE: Sites created this way does not work in Share as they lack dashboards.
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
                createContainer(siteService, shortNameWithVersion, OpenDeskModel.DOCUMENT_LIBRARY);
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

    public static String getFileName (NodeService nodeService, NodeRef nodeRef, String fileName) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        int currentHighest = 0;
        String name = fileName.split("\\.")[0];
        String ext = fileName.split("\\.")[1];
        boolean match = false;

        for (ChildAssociationRef child : childAssociationRefs) {

            String file = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_NAME);
            String file_name = "";
            if (file.contains("(")) {
                file_name = file.split("\\(")[0];
            } else {
                file_name = file.split("\\.")[0];
            }

            if (file_name.trim().equals(name.trim())) {
                match = true;

                int number = 0;
                Matcher m = Pattern.compile("\\((.d?)\\)").matcher(file);
                while (m.find()) {
                    number = Integer.valueOf(m.group(1));
                }

                if (number > currentHighest) {
                    currentHighest = number;
                }

            }
        }

        if (match) {
            currentHighest++;
            fileName = name + "(" + currentHighest + ")." + ext;
        }
        return fileName;
    }

    public static String getDocumentTemplate(SearchService searchService, SiteService siteService)
            throws SearcherException {
        String query = "ASPECT:\"" + OpenDeskModel.ASPECT_PD_DOCUMENT + "\" ";

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);

        if (siteSearchResult.length() == 0) {
            String error = "A site with the document_template aspect was not found.";
            error += " Please add a Document Template folder";
            throw new SearcherException(error);
        }

        NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
        SiteInfo siteInfo = siteService.getSite(siteNodeRef);
        return siteInfo.getShortName();
    }
}