package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentData;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.*;

public class NodeBean {

    private PersonService personService;
    private NodeService nodeService;
    private PermissionService permissionService;
    private SiteService siteService;

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    public JSONObject getNodeInfo(NodeRef nodeRef) throws JSONException {
        if (!nodeService.hasAspect(nodeRef, ContentModel.ASPECT_HIDDEN)) {

            JSONObject json = new JSONObject();
            String name = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
            json.put("name", name);

            QName qname = nodeService.getType(nodeRef);

            String type;
            if (qname.equals(ContentModel.TYPE_FOLDER)) {
                type = "cmis:folder";
            }
            else if (qname.equals(OpenDeskModel.PROP_LINK)) {
                type = "cmis:link";
            }
            else if (qname.equals(ContentModel.TYPE_CONTENT)) {
                type = "cmis:document";
                ContentData contentData = (ContentData) nodeService.getProperty(nodeRef, ContentModel.PROP_CONTENT);
                if(contentData != null) {
                    String mimeType = contentData.getMimetype();
                    json.put("mimeType", mimeType);
                }
            }
            else
                type = "cmis:folder";

            AccessStatus accessStatus = permissionService.hasPermission(nodeRef, PermissionService.DELETE);
            json.put("canMoveAndDelete", accessStatus == AccessStatus.ALLOWED);

            json.put("contentType", type);

            if (!"cmis:link".equals(type)) {
                json.put("nodeRef", nodeRef);

                ChildAssociationRef parent = nodeService.getPrimaryParent(nodeRef);

                json.put("parentNodeRef", parent.getParentRef());
                json.put("shortRef", nodeRef.getId());


                String modifier = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_MODIFIER);
                if(personService.personExists(modifier)) {
                    NodeRef person = personService.getPerson(modifier);
                    json.put("lastChangedBy", nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(person, ContentModel.PROP_LASTNAME));
                }
                else
                    json.put("lastChangedBy", "Administrator");

                Date d = (Date) nodeService.getProperty(nodeRef, ContentModel.PROP_MODIFIED);
                json.put("lastChanged", d.getTime());

                boolean hasHistory = false;
                if (nodeService.hasAspect(nodeRef, ContentModel.ASPECT_VERSIONABLE)) {
                    String versionLabel = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_VERSION_LABEL);
                    if (versionLabel != null && !versionLabel.equals("1.0"))
                        hasHistory = true;
                }
                json.put("hasHistory", hasHistory);
            } else {
                String linkSiteShortName = (String) nodeService.getProperty(nodeRef, OpenDeskModel.PROP_LINK_TARGET);
                NodeRef linkNodeRef = (NodeRef) nodeService.getProperty(nodeRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF);

                json.put("nodeid", nodeRef.getId());
                json.put("destination_link", linkSiteShortName);
                json.put("nodeRef", nodeRef);

                if (linkNodeRef != null) {
                    json.put("destination_nodeid", linkNodeRef.getId());

                    SiteInfo linkSiteInfo = siteService.getSite(linkSiteShortName);
                    String linkSiteDisplayName = linkSiteInfo.getTitle();
                    json.put("name", linkSiteDisplayName);
                }
            }
            return json;
        }
        return null;
    }

    /**
     * Gets children
     * @param parentNodeRef nodeRef of the parent node.
     * @return a JSONArray containing a list of properties of each child node.
     */
    public JSONArray getChildren(NodeRef parentNodeRef) throws JSONException {

        JSONArray result = new JSONArray();

        List<String> contentTypes = new ArrayList<>();
        contentTypes.add("cmis:document");
        contentTypes.add("cmis:folder");
        contentTypes.add("cmis:link");

        Map<String, JSONArray> contentTypeMap = new HashMap<>();
        for (String contentType : contentTypes)
            contentTypeMap.put(contentType, new JSONArray());

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(parentNodeRef);

        for (ChildAssociationRef childAssociationRef : childAssociationRefs) {

            NodeRef childNodeRef = childAssociationRef.getChildRef();
            JSONObject nodeInfo = getNodeInfo(childNodeRef);
            if(nodeInfo != null) {
                String contentType = nodeInfo.getString("contentType");
                contentTypeMap.get(contentType).add(nodeInfo);
            }
        }

        for (String contentType : contentTypes)
            result.add(contentTypeMap.get(contentType));

        return result;
    }
}
