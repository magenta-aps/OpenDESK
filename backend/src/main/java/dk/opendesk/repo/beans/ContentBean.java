package dk.opendesk.repo.beans;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
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
import java.util.HashMap;
import java.util.Map;

import static org.alfresco.model.ContentModel.*;
import static org.alfresco.service.namespace.NamespaceService.CONTENT_MODEL_1_0_URI;

public class ContentBean {

    private ContentService contentService;
    private NodeService nodeService;

    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    /**
     * Adds an xml child element to a parent element.
     * @param doc a parent xml document.
     * @param parent a parent element
     * @param name of the child element.
     * @param textContent text content of the child element.
     */
    private void addXMLChild(Document doc, Element parent, String name, String textContent) {
        Element e = doc.createElement(name);
        e.setTextContent(textContent);
        parent.appendChild(e);
    }

    /**
     * Creates a child node.
     * @param n parent nodeRef.
     * @param name of the child node.
     * @param type of the child node.
     * @return the nodeRef to the child node.
     */
    private NodeRef createChildNode(NodeRef n, String name, QName type) {
        Map<QName, Serializable> props = new HashMap<>();
        props.put(ContentModel.PROP_NAME, name);

        return nodeService.createNode(n, ContentModel.ASSOC_CONTAINS,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name),
                type, props).getChildRef();
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
    private Document createComponentXML(DocumentBuilder docBuilder, String siteShortName, String region_id,
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
    private Document createPageXML(DocumentBuilder docBuilder) {
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
     * Creates an xml file.
     * @param parent nodeRef of the parent folder.
     * @param fileName file name of the new xml file.
     * @param xmlDoc the xml document to be saved.
     */
    private void createXMLFile(NodeRef parent, String fileName, Document xmlDoc) {
        fileName += ".xml";

        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(PROP_NAME, fileName);
        NodeRef n = nodeService.createNode(parent, ASSOC_CONTAINS,
                QName.createQName(CONTENT_MODEL_1_0_URI, fileName), TYPE_CONTENT, properties).getChildRef();

        ContentWriter contentWriter = contentService.getWriter(n, ContentModel.PROP_CONTENT, true);
        contentWriter.setMimetype(MimetypeMap.MIMETYPE_XML);
        OutputStream s = contentWriter.getContentOutputStream();

        // Write to new preset file
        try {
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
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
     * Creates a site dashboard for Share
     * @param siteNodeRef nodeRef of the site.
     * @param siteShortName short name of the site.
     */
    public void createSiteDashboard(NodeRef siteNodeRef, String siteShortName) {
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
        try {
            docBuilder = docBuilderFactory.newDocumentBuilder();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
            return;
        }

        // Create surf-config folder
        NodeRef surfConfigRef = createChildNode(siteNodeRef, "surf-config", ContentModel.TYPE_FOLDER);
        Map<QName, Serializable> aspectProps = new HashMap<>();
        nodeService.addAspect(surfConfigRef, ContentModel.ASPECT_HIDDEN, aspectProps);

        // Create components folder
        NodeRef componentsRef = createChildNode(surfConfigRef, "components", ContentModel.TYPE_FOLDER);

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
            createXMLFile(componentsRef, name, doc);
        }

        // Create pages folder
        NodeRef pagesRef = createChildNode(surfConfigRef, "pages", ContentModel.TYPE_FOLDER);
        NodeRef siteRef = createChildNode(pagesRef, "site", ContentModel.TYPE_FOLDER);
        NodeRef siteShortNameRef = createChildNode(siteRef, siteShortName, ContentModel.TYPE_FOLDER);

        Document dashboardDoc = createPageXML(docBuilder);
        createXMLFile(siteShortNameRef, "dashboard", dashboardDoc);
    }

    public JSONObject getContent(NodeRef nodeRef) throws JSONException {
        ContentReader reader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
        String contentString = reader.getContentString();
        return new JSONObject(contentString);
    }
}
