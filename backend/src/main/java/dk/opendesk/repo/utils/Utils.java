package dk.opendesk.repo.utils;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    /**
     * A list of mappings of site types and site groups.
     */
    public static final Map<String, JSONArray> siteGroups = Collections.unmodifiableMap(
            new HashMap<String, JSONArray>() {
                {
                    put(OpenDeskModel.project, createSiteGroups(OpenDeskModel.project));
                    put(OpenDeskModel.pd_project, createSiteGroups(OpenDeskModel.pd_project));
                }});

    /**
     * Creates JSONArray of site groups.
     * @param siteType type of the site.
     * @return a JSONArray of site groups.
     */
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

    /**
     * Creates a site group.
     * @param shortName short name of the site group.
     * @param authority of the group.
     * @param collapsed true if the group is possible to collapse.
     * @param multipleMembers true if the group can contain multiple members.
     * @return a JSONObject representing the site group.
     */
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

    /**
     * A list of Project Department groups.
     */
    private static Map<String, String> PD_GROUPS = new HashMap<>();

    /**
     * Gets the danish translation for Project Department groups.
     * @param group the short name of the group to translate.
     * @return the translated string.
     */
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
     * Gets the authority name of a site group.
     * @param siteShortName of the site that the group belongs to.
     * @param groupName of the site group.
     * @return the authority name of the site group.
     */
    public static String getAuthorityName (String siteShortName, String groupName)
    {
        String siteGroup = "GROUP_site_" + siteShortName;
        if("".equals(groupName))
            return siteGroup;
        else
            return siteGroup + "_" + groupName;
    }

    /**
     * Creates a site with dashboard, document library and discussions.
     * @param nodeService alfresco standard service.
     * @param contentService alfresco standard service.
     * @param siteService alfresco standard service.
     * @param displayName of the site.
     * @param description of the site.
     * @param siteVisibility of the site.
     * @return the nodeRef of the new site.
     */
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

    /**
     * Creates a container.
     * @param siteService alfresco standard service.
     * @param shortName of the parent site.
     * @param componentId component id of the container.
     * @return a nodeRef to the container.
     */
    private static NodeRef createContainer(SiteService siteService, String shortName, String componentId) {
        return siteService.createContainer(shortName, componentId, ContentModel.TYPE_FOLDER, null);
    }

    /**
     * Creates a child node.
     * @param nodeService alfresco standard service.
     * @param n parent nodeRef.
     * @param name of the child node.
     * @param type of the child node.
     * @return the nodeRef to the child node.
     */
    private static NodeRef createChildNode(NodeService nodeService, NodeRef n, String name, QName type) {
        Map<QName, Serializable> props = new HashMap<>();
        props.put(ContentModel.PROP_NAME, name);

        return nodeService.createNode(n, ContentModel.ASSOC_CONTAINS,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name),
                type, props).getChildRef();
    }

    /**
     * Creates a site dashboard for Share
     * @param nodeService alfresco standard service.
     * @param contentService alfresco standard service.
     * @param siteNodeRef nodeRef of the site.
     * @param siteShortName short name of the site.
     */
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

    /**
     * Creates a component xml document.
     * @param docBuilder a DocumentBuilder.
     * @param siteShortName short name of the site.
     * @param region_id region id of the component.
     * @param url of the component.
     * @param height of the component.
     * @return an xml document representation of the component.
     */
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

    /**
     * Creates a page xml document.
     * @param docBuilder a DocumentBuilder.
     * @return an xml document representation of the page.
     */
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

    /**
     * Adds an xml child element to a parent element.
     * @param doc a parent xml document.
     * @param parent a parent element
     * @param name of the child element.
     * @param textContent text content of the child element.
     */
    private static void addXMLChild(Document doc, Element parent, String name, String textContent) {
        Element e = doc.createElement(name);
        e.setTextContent(textContent);
        parent.appendChild(e);
    }

    /**
     * Creates an xml file.
     * @param nodeService alfresco standard service.
     * @param contentService alfresco standard service.
     * @param parent nodeRef of the parent folder.
     * @param fileName file name of the new xml file.
     * @param xmlDoc the xml document to be saved.
     */
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

    /**
     * Generates a new random password.
     * @return a new random password.
     */
    public static String generateNewPassword()
    {
        PasswordGenerator passwordGenerator = new PasswordGenerator.PasswordGeneratorBuilder()
                .useDigits(true)
                .useLower(true)
                .useUpper(true)
                .build();
        return passwordGenerator.generate(8); // output ex.: lrU12fmM 75iwI90o
    }

    /**
     * Gets the visibility enum from a string.
     * @param visibilityStr a string representing the visibility.
     * @return an enum representing the visibility.
     */
    public static SiteVisibility getVisibility(String visibilityStr)
    {
        if(visibilityStr.isEmpty())
            return null;
        else
            return SiteVisibility.valueOf(visibilityStr);
    }
}
