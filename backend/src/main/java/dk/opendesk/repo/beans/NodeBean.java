package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.admin.SysAdminParams;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
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
    private NotificationBean notificationBean;

    private FileFolderService fileFolderService;
    private NodeService nodeService;
    private PermissionService permissionService;
    private PersonService personService;
    private Repository repository;
    private SearchService searchService;
    private SiteService siteService;
    private SysAdminParams sysAdminParams;

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
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
    public void setSysAdminParams(SysAdminParams sysAdminParams) { this.sysAdminParams = sysAdminParams; }

    public JSONObject getChildInfo(NodeRef nodeRef) throws JSONException {
        return getNodeInfo(nodeRef, false);
    }

    public JSONObject getMetadata(NodeRef nodeRef) throws JSONException {
        JSONObject json = new JSONObject();
        String host = sysAdminParams.getAlfrescoHost();
        json.put("serverURL", host);
        return json;
    }

    public NodeRef getNodeByPath(List<String> path) throws FileNotFoundException {
        NodeRef companyHome = getCompanyHome();
        return fileFolderService.resolveNamePath(companyHome, path).getNodeRef();
    }

    public JSONObject getNodeType(NodeRef nodeRef) throws JSONException {
        JSONObject json = new JSONObject();
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

        json.put("contentType", type);
        return json;
    }

    public JSONObject getNodeInfo(NodeRef nodeRef) throws JSONException {
        return getNodeInfo(nodeRef, true);
    }

    public JSONObject getNodeInfo(NodeRef nodeRef, boolean isExtensive) throws JSONException {
        if (!nodeService.hasAspect(nodeRef, ContentModel.ASPECT_HIDDEN)) {

            JSONObject json = getNodeType(nodeRef);
            String name = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
            json.put("name", name);

            if(isExtensive) {
                JSONObject metadata = getMetadata(nodeRef);
                json.put("metadata", metadata);
            }

            AccessStatus canEdit = permissionService.hasPermission(nodeRef, PermissionService.WRITE);
            json.put("canEdit", canEdit == AccessStatus.ALLOWED);

            AccessStatus canDelete = permissionService.hasPermission(nodeRef, PermissionService.DELETE);
            json.put("canMoveAndDelete", canDelete == AccessStatus.ALLOWED);

            if (!"cmis:link".equals(json.getString("contentType"))) {
                json.put("nodeRef", nodeRef);

                ChildAssociationRef parentChildAssocRef = nodeService.getPrimaryParent(nodeRef);

                QName qName = parentChildAssocRef.getQName();
                boolean isVersionPreviewable = qName.equals(OpenDeskModel.ASPECT_VERSION_PREVIEWABLE);
                json.put("isVersion", isVersionPreviewable);

                NodeRef parentRef = parentChildAssocRef.getParentRef();
                json.put("parentNodeRef", parentRef);
                json.put("parentNodeId", parentRef.getId());
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


                if ("cmis:document".equals(json.getString("contentType"))) {
                    String lockType = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_LOCK_TYPE);
                    boolean isLocked = lockType != null;
                    json.put("isLocked", isLocked);
                    if(isLocked)
                        json.put("lockType", lockType);
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

    /**
     * Gets root info for the Node Picker.
     * @return a JSONObject containing info and all root nodes.
     */
    public JSONObject getNodePickerRootInfo() throws JSONException {

        List<String> rootFolders = new ArrayList<>();
        rootFolders.add(OpenDeskModel.NODE_PICKER_MY_DOCS);
        rootFolders.add(OpenDeskModel.NODE_PICKER_SHARED_DOCS);
        rootFolders.add(OpenDeskModel.NODE_PICKER_SITES);

        JSONObject result = new JSONObject();
        JSONArray children = new JSONArray();
        for(String rootFolder : rootFolders) {
            JSONObject root = new JSONObject();
            root.put("rootName", rootFolder);
            if(OpenDeskModel.NODE_PICKER_MY_DOCS.equals(rootFolder))
            {
                root.put("nodeRef", getUserHome());
            }

            children.add(root);
        }
        result.put("children", children);
        return result;
    }

    /**
     * Gets root node info for the Node Picker.
     * @param rootName Name of the parent root folder.
     * @return a JSONObject containing info and all child nodes.
     */
    public JSONObject getNodePickerRootNodeInfo(String rootName) throws Exception {
        JSONObject result;

        switch(rootName) {
            case OpenDeskModel.NODE_PICKER_MY_DOCS:
                result = getNodePickerMyDocs();
                break;
            case OpenDeskModel.NODE_PICKER_SHARED_DOCS:
                result = getNodePickerSharedDocs();
                break;
            case OpenDeskModel.NODE_PICKER_SITES:
                result = getNodePickerSites();
                break;
            default:
                throw new Exception("Unknown Root Node");
        }

        result.put("rootName", rootName);
        return result;
    }

    private JSONObject getNodePickerMyDocs() throws JSONException {
        List<NodeRef> myNodeRefs = getMyDocs();
        return getNodePickerChildren(myNodeRefs);
    }

    private JSONObject getNodePickerSharedDocs() throws JSONException {
        List<NodeRef> sharedNodeRefs = getSharedDocs();
        return getNodePickerChildren(sharedNodeRefs);
    }

    private JSONObject getNodePickerSites() throws JSONException {
        List<SiteInfo> sites = siteService.listSites("", "");
        ArrayList<NodeRef> childrenRefs = new ArrayList<>();
        for (SiteInfo siteInfo : sites) {
            childrenRefs.add(siteInfo.getNodeRef());
        }
        return getNodePickerChildren(childrenRefs);
    }

    /**
     * Gets node info for the Node Picker.
     * @param nodeRef of the parent node.
     * @return a JSONArray containing JSONObjects for all child nodes.
     */
    public JSONObject getNodePickerNodeInfo(NodeRef nodeRef) throws Exception {

        // If the node is the user's home then return it as a Root Folder
        if(nodeRef.equals(getUserHome()))
            return getNodePickerRootNodeInfo(OpenDeskModel.NODE_PICKER_MY_DOCS);

        // Children
        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);
        ArrayList<NodeRef> childrenRefs = new ArrayList<>();
        for (ChildAssociationRef child : childAssociationRefs) {
            childrenRefs.add(child.getChildRef());
        }
        JSONObject result = getNodePickerChildren(childrenRefs);

        // Parent
        NodeRef parentRef = nodeService.getPrimaryParent(nodeRef).getParentRef();
        JSONObject parentObj = getNodePickerNodeParent(parentRef);
        if(parentObj != null)
            result.put("parent", parentObj);

        // Node
        result.put("nodeRef", nodeRef.toString());

        // If the parent is a site then change the node ref to match the site and not its document library
        if(parentObj != null && parentObj.has("rootName")) {
            String rootName = (String) parentObj.get("rootName");
            if (OpenDeskModel.NODE_PICKER_SITES.equals(rootName)) {
                nodeRef = parentRef;
            }
        }
        String nodeName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
        result.put("name", nodeName);

        return result;
    }

    private JSONObject getNodePickerNodeParent(NodeRef parentRef) throws JSONException {
        JSONObject result = new JSONObject();

        // Return null if the parentRef was null.
        if (parentRef == null)
            return null;

        AccessStatus readAccess = permissionService.hasPermission(parentRef, PermissionService.READ);

        // If the user does not have access to the parent then the folder must be shared from another user's home.
        if(!readAccess.equals(AccessStatus.ALLOWED))
            result.put("rootName", OpenDeskModel.NODE_PICKER_SHARED_DOCS);

        // If the parent is the user's home then return it as a Root Folder
        else if(parentRef.equals(getUserHome()))
            result.put("rootName", OpenDeskModel.NODE_PICKER_MY_DOCS);

        // If the parent is a site then this is a document library and the parent should be the Root Folder Sites
        else if (nodeService.getType(parentRef).equals(SiteModel.TYPE_SITE))
            result.put("rootName", OpenDeskModel.NODE_PICKER_SITES);

        else {
            result.put("nodeRef", parentRef);
            String nodeName = (String) nodeService.getProperty(parentRef, ContentModel.PROP_NAME);
            result.put("name", nodeName);
        }

        return result;
    }

    private JSONObject getNodePickerChildren(List<NodeRef> childrenRefs) throws JSONException {
        JSONArray children = new JSONArray();
        for (NodeRef childRef : childrenRefs) {
            Map<QName, Serializable> props = nodeService.getProperties(childRef);
            String name = (String) props.get(ContentModel.PROP_NAME);
            QName childNodeType = nodeService.getType(childRef);

            // If the child is a site then link directly to its document library
            if (childNodeType.equals(SiteModel.TYPE_SITE)) {
                childRef = nodeService.getChildByName(childRef, ContentModel.ASSOC_CONTAINS, SiteService.DOCUMENT_LIBRARY);
                childNodeType = ContentModel.TYPE_FOLDER;
            }

            // Only folders, content and sites will be displayed
            if (childNodeType.equals(ContentModel.TYPE_FOLDER) ||
                    childNodeType.equals(SiteModel.TYPE_SITES) ||
                    childNodeType.equals(ContentModel.TYPE_CONTENT)) {

                JSONObject childJson = getNodeType(childRef);
                childJson.put("nodeRef", childRef);
                childJson.put("name", name);

                children.add(childJson);
            }
        }

        JSONObject result = new JSONObject();
        result.put("children", children);
        return result;
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
            JSONObject nodeInfo = getChildInfo(nodeRef);
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
     * @return the nodeRef of Company Home.
     */
    public NodeRef getCompanyHome() {
        return repository.getCompanyHome();
    }

    /**
     * Gets the User Home.
     * @return the nodeRef of User Home.
     */
    public NodeRef getUserHome() {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        NodeRef userRef = personService.getPerson(userName);
        return repository.getUserHome(userRef);
    }

    /**
     * Gets children
     * @param parentNodeRef nodeRef of the parent node.
     * @return a List of each child node.
     */
    public List<NodeRef> getChildren(NodeRef parentNodeRef) {
        List<NodeRef> nodeRefs = new ArrayList<>();
        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(parentNodeRef);
        for (ChildAssociationRef childAssociationRef : childAssociationRefs) {
            nodeRefs.add(childAssociationRef.getChildRef());
        }
        return nodeRefs;
    }

    public List<NodeRef> getMyDocs() {
        NodeRef userHomeRef = getUserHome();
        return getChildren(userHomeRef);
    }

    /**
     * Gets shared nodes
     * @return a List of each shared node.
     */
    public List<NodeRef> getSharedDocs() {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        List<NodeRef> nodeRefs = new ArrayList<>();
        String query = "PATH:\"app:company_home/app:user_homes//*\"";
        String property = OpenDeskModel.OD_PREFIX + "\\:" + OpenDeskModel.PROP_SHARED_WITH.getLocalName();
        query += "AND @" + property + ":\"" + userName + "\"";
        ResultSet resultSet = searchService.query(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, "lucene", query);

        for (ResultSetRow result : resultSet) {
            nodeRefs.add(result.getNodeRef());
        }
        return nodeRefs;
    }

    public void shareNode(NodeRef nodeRef, String userName, String permission) throws JSONException {
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
        notificationBean.notifySharedNode(userName, nodeRef);
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
