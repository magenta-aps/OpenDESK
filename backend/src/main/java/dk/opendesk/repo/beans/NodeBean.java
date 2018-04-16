package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.ResultSetRow;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.io.Serializable;
import java.util.*;

public class NodeBean {

    private NodeService nodeService;
    private PermissionService permissionService;
    private PersonService personService;
    private PreferenceService preferenceService;
    private Repository repository;
    private SearchService searchService;
    private SiteService siteService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }
    public void setRepository(Repository repository)
    {
        this.repository = repository;
    }
    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
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

            AccessStatus canDelete = permissionService.hasPermission(nodeRef, PermissionService.DELETE);
            json.put("canMoveAndDelete", canDelete == AccessStatus.ALLOWED);

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

                String creator = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_CREATOR);
                if (creator != null) {
                    if (personService.personExists(creator)) {
                        NodeRef personRef = personService.getPerson(creator);
                        JSONObject creatorObject = Utils.convertUserToJSON(nodeService, personRef);
                        json.put("creator", creatorObject);
                    }
                }

                if(canDelete == AccessStatus.ALLOWED) {
                    json.put("permissions", getNodeShareInfo(nodeRef));
                }
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

    private JSONObject getNodeShareInfo(NodeRef nodeRef) throws JSONException {
        JSONObject permissionGroups = new JSONObject();
        permissionGroups.put("Editor", new JSONArray());
        permissionGroups.put("Consumer", new JSONArray());

        Set<AccessPermission> permissions = permissionService.getAllSetPermissions(nodeRef);
        for (AccessPermission permission : permissions)
        {
            String permissionKey = permission.getPermission();
            if (permissionGroups.has(permissionKey) &&
                    permission.getAuthorityType() == AuthorityType.USER &&
                    permission.getAccessStatus() == AccessStatus.ALLOWED) {
                //Get user object
                String userName = permission.getAuthority();
                if(personService.personExists(userName)) {
                    NodeRef personRef = personService.getPerson(userName);
                    JSONObject userObject = Utils.convertUserToJSON(nodeService, personRef);
                    // Add to matching permission group
                    permissionGroups.getJSONArray(permissionKey).put(userObject);
                }
            }
        }
        return permissionGroups;
    }

    public JSONArray getBreadCrumb(NodeRef nodeRef, NodeRef rootRef) throws JSONException {
        JSONArray breadCrumb = new JSONArray();

        NodeRef parentRef = nodeRef;
        AccessStatus readAccess = AccessStatus.ALLOWED;
        while (readAccess == AccessStatus.ALLOWED && !parentRef.getId().equals(rootRef.getId())) {
            JSONObject parentObj = new JSONObject();
            String name = (String) nodeService.getProperty(parentRef, ContentModel.PROP_NAME);
            if (name != null) {
                parentObj.put("name", name);
                parentObj.put("nodeRef", parentRef);
                breadCrumb.add(parentObj);
            }
            parentRef = nodeService.getPrimaryParent(parentRef).getParentRef();
            readAccess = permissionService.hasPermission(parentRef, PermissionService.READ);
        }

        return breadCrumb;
    }

    public JSONArray getNodeList(List<NodeRef> nodeRefs) throws JSONException {

        JSONArray result = new JSONArray();

        List<String> contentTypes = new ArrayList<>();
        contentTypes.add("cmis:document");
        contentTypes.add("cmis:folder");
        contentTypes.add("cmis:link");

        Map<String, JSONArray> contentTypeMap = new HashMap<>();
        for (String contentType : contentTypes)
            contentTypeMap.put(contentType, new JSONArray());

        for (NodeRef nodeRef : nodeRefs) {
            JSONObject nodeInfo = getNodeInfo(nodeRef);
            if(nodeInfo != null) {
                String contentType = nodeInfo.getString("contentType");
                contentTypeMap.get(contentType).add(nodeInfo);
            }
        }

        for (String contentType : contentTypes)
            result.add(contentTypeMap.get(contentType));

        return result;
    }

    /**
     * Gets the Company Home.
     * @return a JSONArray containing nodeRef of Company Home.
     */
    public JSONArray getCompanyHome() {
        NodeRef companyHome = repository.getCompanyHome();
        return Utils.getJSONReturnPair("nodeRef", companyHome.toString());
    }

    /**
     * Gets the User Home.
     * @return a JSONArray containing nodeRef of User Home.
     */
    public JSONArray getUserHome() {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        NodeRef userRef = personService.getPerson(userName);
        NodeRef userHome = repository.getUserHome(userRef);
        return Utils.getJSONReturnPair("nodeRef", userHome.toString());
    }

    /**
     * Gets children
     * @param parentNodeRef nodeRef of the parent node.
     * @return a JSONArray containing a list of properties of each child node.
     */
    public JSONArray getChildren(NodeRef parentNodeRef) throws JSONException {
        List<NodeRef> nodeRefs = new ArrayList<>();
        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(parentNodeRef);
        for (ChildAssociationRef childAssociationRef : childAssociationRefs) {
            nodeRefs.add(childAssociationRef.getChildRef());
        }
        return getNodeList(nodeRefs);
    }

    /**
     * Gets shared nodes
     * @return a JSONArray containing a list of properties of each shared node.
     */
    public JSONArray getShared() throws JSONException {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        List<NodeRef> nodeRefs = new ArrayList<>();
        String query = "PATH:\"app:company_home/app:user_homes//*\"";
        String property = OpenDeskModel.OD_PREFIX + "\\:" + OpenDeskModel.PROP_SHARED_WITH.getLocalName();
        query += "AND @" + property + ":\"" + userName + "\"";
        ResultSet resultSet = searchService.query(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, "lucene", query);

        for (ResultSetRow result : resultSet) {
            nodeRefs.add(result.getNodeRef());
        }
        return getNodeList(nodeRefs);
    }

    public void shareNode(NodeRef nodeRef, String userName, String permission) {
        // Add permission first
        permissionService.setPermission(nodeRef, userName, permission, true);

        // If permissions were added fine then add the user to list of users that the node is shared with
        Map<QName, Serializable> properties = new HashMap<>();
        properties.put(OpenDeskModel.PROP_SHARED_WITH, userName);
        if(nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_SHARED)) {
            List<String> values = (List<String>) nodeService.getProperty(nodeRef, OpenDeskModel.PROP_SHARED_WITH);
            values.add(userName);
            nodeService.setProperty(nodeRef, OpenDeskModel.PROP_SHARED_WITH, (Serializable) values);
        }
        else
            nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_SHARED, properties);
    }

    public void stopSharingNode(NodeRef nodeRef, String userName, String permission) {
        // Remove the user to list of users that the node is shared with
        if(nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_SHARED)) {
            List<String> values = (List<String>) nodeService.getProperty(nodeRef, OpenDeskModel.PROP_SHARED_WITH);
            values.remove(userName);
            nodeService.setProperty(nodeRef, OpenDeskModel.PROP_SHARED_WITH, (Serializable) values);
        }

        // Then remove permission
        permissionService.deletePermission(nodeRef, userName, permission);
    }

    public JSONArray preProcessMove(ArrayList<NodeRef> nodeRefs, NodeRef destinationRef) {

        for (NodeRef nodeRef : nodeRefs) {
            String nodeRefParent = nodeService.getPath(nodeRef).get(2).getElementString();
            String destinationParent = nodeService.getPath(destinationRef).get(2).getElementString();

            if (!nodeRefParent.equals(destinationParent)) {
                permissionService.deletePermissions(nodeRef);
                if (nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_SHARED)) {
                    nodeService.removeAspect(nodeRef, OpenDeskModel.ASPECT_SHARED);
                }
            }
        }
        return Utils.getJSONSuccess();
    }
}
