//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.admin.SysAdminParams;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteMembership;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.dictionary.*;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.ResultSetRow;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AccessPermission;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionHistory;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NodeBean {
    private EditorBean editorBean;
    private NotificationBean notificationBean;
    private PersonBean personBean;

    private DictionaryService dictionaryService;
    private ContentService contentService;
    private FileFolderService fileFolderService;
    private NamespaceService namespaceService;
    private NodeService nodeService;
    private PermissionService permissionService;
    private Repository repository;
    private SearchService searchService;
    private SiteService siteService;
    private SysAdminParams sysAdminParams;
    private VersionService versionService;

    public void setEditorBean(EditorBean editorBean) {
        this.editorBean = editorBean;
    }
    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }
    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }
    public void setDictionaryService(DictionaryService dictionaryService) {
        this.dictionaryService = dictionaryService;
    }
    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }
    public void setNamespaceService(NamespaceService namespaceService) {
        this.namespaceService = namespaceService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
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
    public void setVersionService(VersionService versionService) {
        this.versionService = versionService;
    }

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

    /**
     * Gets the next available file name for a new file.
     * @param folderRef of the destination folder.
     * @param fileNameAndExt original name of the new file.
     * @param isContent True if the node is content
     * @return the next available file name.
     */
    public String getNextAvailableName(NodeRef folderRef, String fileNameAndExt, boolean isContent) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(folderRef);

        int currentHighest = 0;
        String[] fileNameParts = getNameAndExtension(fileNameAndExt, isContent);
        String fileName = fileNameParts[0];
        String fileExt = fileNameParts[1];

        boolean match = false;

        for (ChildAssociationRef child : childAssociationRefs) {

            String nodeNameAndExt = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_NAME);
            String[] nodeNameParts = getNameAndExtension(nodeNameAndExt, isContent);
            String nodeExt = nodeNameParts[1];
            String nodeName;
            if(nodeNameAndExt.contains("("))
                nodeName = nodeNameAndExt.split("\\(")[0];
            else
                nodeName = nodeNameParts[0];

            if (fileName.equals(nodeName) && fileExt.equals(nodeExt)) {
                match = true;
                Matcher m = Pattern.compile("\\((.d?)\\)").matcher(nodeNameAndExt);

                int number = 0;
                while (m.find())
                    number = Integer.valueOf(m.group(1));

                if (number > currentHighest)
                    currentHighest = number;
            }
        }

        if (match) {
            currentHighest++;
            return fileName + "(" + currentHighest + ")" + fileExt;
        }
        return fileNameAndExt;
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
            String fileExtension = getFileExtension(nodeRef);
            if(fileExtension != null) {
                String fileType = fileExtension.substring(1);
                json.put("fileType", fileType.toLowerCase());
            }
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
        // Return null if the node is hidden
        if (nodeService.hasAspect(nodeRef, ContentModel.ASPECT_HIDDEN))
            return null;

        JSONObject json = getNodeType(nodeRef);
        String name = getName(nodeRef);
        json.put("name", name);

        if(isExtensive) {
            JSONObject metadata = getMetadata(nodeRef);
            json.put("metadata", metadata);
        }

        AccessStatus hasWritePermission = permissionService.hasPermission(nodeRef, PermissionService.WRITE);
        boolean canEdit = hasWritePermission == AccessStatus.ALLOWED;
        json.put("canEdit", canEdit);

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
            String displayName = personBean.getDisplayName(modifier);
            if(displayName != null) {
                json.put("lastChangedBy", displayName);
            }
            else
                json.put("lastChangedBy", "Administrator");

            Date d = (Date) nodeService.getProperty(nodeRef, ContentModel.PROP_MODIFIED);
            json.put("lastChanged", d.getTime());

            JSONArray versions = getVersions(nodeRef);
            json.put("versions", versions);

            String creator = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_CREATOR);
            if (creator != null) {
                JSONObject creatorObject = personBean.getPersonInfo(creator);
                if(creatorObject != null) {
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

                if(json.has("mimeType")) {
                    String mimeType = json.getString("mimeType");
                    if (mimeType != null) {
                        JSONObject editors = editorBean.getEditInfo(mimeType, canEdit, isLocked, lockType);
                        json.put("editors", editors);
                    }
                }
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
                JSONObject userObject = personBean.getPersonInfo(userName);
                if(userObject != null) {
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
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        // List all the sites that the specified user has a explicit membership to.
        List<SiteMembership> siteMemberships = siteService.listSiteMemberships(userName, 0);
        ArrayList<NodeRef> childrenRefs = new ArrayList<>();
        for (SiteMembership siteMembership : siteMemberships) {
            String role = siteMembership.getRole();
            if(!role.equals(SiteModel.SITE_CONSUMER)) {
                SiteInfo siteInfo = siteMembership.getSiteInfo();
                childrenRefs.add(siteInfo.getNodeRef());
            }
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
        String nodeName = getName(nodeRef);
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
            QName childNodeType = nodeService.getType(childRef);

            // Important to get name before changing childRef to its document library
            String name = getName(childRef);

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

    public JSONObject getConstraint(ConstraintDefinition constraintDefinition) throws JSONException {
        JSONObject result = new JSONObject();
        Constraint constraint = constraintDefinition.getConstraint();
        String type = constraint.getType();
        result.put("type", type);
        Map<String, Object> parametersMap = constraint.getParameters();
        JSONObject parameters = new JSONObject(parametersMap);
        result.put("parameters", parameters);
        return result;
    }

    public JSONArray getConstraints(List<ConstraintDefinition> constraints) throws JSONException {
        JSONArray result = new JSONArray();
        for (ConstraintDefinition constraintDefinition : constraints) {
            JSONObject constraint = getConstraint(constraintDefinition);
            result.add(constraint);
        }
        return result;
    }

    /**
     * Gets the User Home.
     * @return the nodeRef of User Home.
     */
    public NodeRef getUserHome() {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        NodeRef userRef = personBean.getPerson(userName);
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

    public JSONArray getChildrenInfo(NodeRef parentNodeRef) throws JSONException {
        List<NodeRef> childNodeRefs = getChildren(parentNodeRef);
        return getNodeList(childNodeRefs);
    }

    public List<NodeRef> getMyDocs() {
        NodeRef userHomeRef = getUserHome();
        return getChildren(userHomeRef);
    }

    public JSONObject getPropertyDefinition(QName propertyName) throws JSONException {
        JSONObject result = new JSONObject();
        PropertyDefinition propertyDef = dictionaryService.getProperty(propertyName);
        String title = propertyDef.getTitle();
        result.put("title", title);
        String description = propertyDef.getDescription();
        result.put("description", description);
        DataTypeDefinition dataType = propertyDef.getDataType();
        if(dataType != null) {
            QName dataTypeQName = dataType.getName();
            QName dataTypePrefixedQName = dataTypeQName.getPrefixedQName(namespaceService);
            String prefixString = dataTypePrefixedQName.toPrefixString();
            result.put("dataTypeName", prefixString);
        }
        String defaultValue = propertyDef.getDefaultValue();
        result.put("defaultValue", defaultValue);
        boolean mandatory = propertyDef.isMandatory();
        result.put("mandatory", mandatory);
        boolean multiValued = propertyDef.isMultiValued();
        result.put("multiValued", multiValued);
        List<ConstraintDefinition> constraintDefinitions = propertyDef.getConstraints();
        JSONArray constraints = getConstraints(constraintDefinitions);
        result.put("constraints", constraints);

        return result;
    }

    public JSONObject getPropertyDefinitions(NodeRef nodeRef) throws JSONException {
        JSONObject result = new JSONObject();
        Map<QName, Serializable> properties = nodeService.getProperties(nodeRef);
        for(QName propertyName : properties.keySet()) {
            JSONObject propertyDefinition = getPropertyDefinition(propertyName);
            QName propertyNamePrefixedQName = propertyName.getPrefixedQName(namespaceService);
            String prefixString = propertyNamePrefixedQName.toPrefixString();
            result.put(prefixString, propertyDefinition);
        }
        return result;
    }

    private NodeRef getPropertyUIDefinitionsNode(QName typeName) throws FileNotFoundException {
        List<String> path = new ArrayList<>(OpenDeskModel.PATH_OD_PROPERTY_UI_DEFINITIONS);
        QName typeNamePrefixedQName = typeName.getPrefixedQName(namespaceService);
        String prefixString = typeNamePrefixedQName.toPrefixString();
        String prefixLocal[] = QName.splitPrefixedQName(prefixString);
        path.add(prefixLocal[0]);
        path.add(prefixLocal[1] + ".json");
        return getNodeByPath(path);
    }

    public JSONObject getPropertyUIDefinitions(NodeRef nodeRef) throws FileNotFoundException, JSONException {
        QName type = nodeService.getType(nodeRef);
        return getPropertyUIDefinitions(type);
    }

    public JSONObject getPropertyUIDefinitions(QName typeName) throws FileNotFoundException, JSONException {
        NodeRef nodeRef = getPropertyUIDefinitionsNode(typeName);
        ContentReader reader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
        String contentString = reader.getContentString();
        return new JSONObject(contentString);
    }

    public JSONObject getPropertyUIDefinition(QName typeName, String property) throws FileNotFoundException, JSONException {
        JSONObject propertyUIDefinitions = getPropertyUIDefinitions(typeName);
        return propertyUIDefinitions.getJSONObject(property);
    }

    private NodeRef getWidgetNode() throws FileNotFoundException {
        return getNodeByPath(OpenDeskModel.PATH_OD_PROPERTY_WIDGETS);
    }

    public JSONObject getWidgets() throws FileNotFoundException, JSONException {
        NodeRef nodeRef = getWidgetNode();
        ContentReader reader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
        String contentString = reader.getContentString();
        return new JSONObject(contentString);
    }

    public JSONObject getWidget(String property) throws FileNotFoundException, JSONException {
        JSONObject propertyWidgets = getWidgets();
        return propertyWidgets.getJSONObject(property);
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

    public void preProcessMove(ArrayList<NodeRef> nodeRefs, NodeRef destinationRef) {

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
    }

    public void rename(NodeRef nodeRef, String name) {
        QName qname = nodeService.getType(nodeRef);
        if (qname.equals(ContentModel.TYPE_CONTENT)) {
            String fileExtension = getFileExtension(nodeRef);
            if(fileExtension != null)
                name += fileExtension;
        }
        nodeService.setProperty(nodeRef, ContentModel.PROP_NAME, name);
    }

    public String getName(NodeRef nodeRef) {
        QName type = nodeService.getType(nodeRef);
        if (type.equals(SiteModel.TYPE_SITE))
            return (String) nodeService.getProperty(nodeRef, ContentModel.PROP_TITLE);
        else if (type.equals(ContentModel.TYPE_FOLDER))
            return (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
        String[] nameAndExtension = getNameAndExtension(nodeRef);
        return nameAndExtension[0];
    }

    public String getFileExtension(NodeRef nodeRef) {
        String[] nameAndExtension = getNameAndExtension(nodeRef);
        return nameAndExtension[1];
    }

    private String[] getNameAndExtension(NodeRef nodeRef) {
        String name = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
        boolean isContent = isContent(nodeRef);
        return getNameAndExtension(name, isContent);
    }

    private String[] getNameAndExtension(String name, boolean isContent) {
        String[] split = new String[2];
        if(isContent) {
            int extensionIndex = name.lastIndexOf(".");
            if (extensionIndex > 0) {
                split[0] = name.substring(0, extensionIndex);
                split[1] = name.substring(extensionIndex);
            } else {
                split[0] = name;
            }
        }
        else {
            split[0] = name;
            split[1] = "";
        }
        return split;
    }

    /**
     * Creates a thumbnail of a version
     * @param nodeId id of parent node.
     * @param versionId id of version node.
     * @return a JSONArray containing a JSONObject 'nodeRef'.
     */
    public NodeRef getThumbnail(String nodeId, String versionId) {

        NodeRef nodeRef = new NodeRef("workspace", "SpacesStore", nodeId);
        NodeRef versionRef = new NodeRef("versionStore", "version2Store", versionId);

        Serializable parentName = nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
        Serializable versionLabel = nodeService.getProperty(versionRef, ContentModel.PROP_VERSION_LABEL);
        String name =  "(v. " + versionLabel + ") " + parentName;
        NodeRef versionPreviewRef = nodeService.getChildByName(nodeRef, OpenDeskModel.ASSOC_VERSION_PREVIEW, name);
        if(versionPreviewRef != null)
            return versionPreviewRef;

        AuthenticationUtil.runAs(() -> {
            // Add version previewable aspect if it is not present
            if(!nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_VERSION_PREVIEWABLE))
                nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_VERSION_PREVIEWABLE, null);

            // Create new preview node of earlier version
            Map<QName, Serializable> properties = new HashMap<>();
            properties.put(ContentModel.PROP_NAME, name);
            Serializable content = nodeService.getProperty(versionRef, ContentModel.PROP_CONTENT);
            properties.put(ContentModel.PROP_CONTENT, content);
            QName cmName = QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, name);
            ChildAssociationRef childAssocRef = nodeService.createNode(
                    nodeRef,
                    OpenDeskModel.ASSOC_VERSION_PREVIEW,
                    cmName,
                    ContentModel.TYPE_CONTENT,
                    properties);
            nodeService.addAspect(childAssocRef.getChildRef(), ContentModel.ASPECT_HIDDEN, null);
            return true;
        }, AuthenticationUtil.getSystemUserName());
        versionPreviewRef = nodeService.getChildByName(nodeRef, OpenDeskModel.ASSOC_VERSION_PREVIEW, name);
        if(versionPreviewRef != null)
            return versionPreviewRef;
        else
            return null;
    }

    /**
     * Gets versions of a node.
     * @param nodeRef of the node.
     * @return a JSONArray containing all versions of the node.
     */
    public JSONArray getVersions(NodeRef nodeRef) throws JSONException {
        JSONArray result = new JSONArray();
        VersionHistory h = versionService.getVersionHistory(nodeRef);

        if (h != null) {
            Collection<Version> versions = h.getAllVersions();

            for (Version v : versions) {

                JSONObject json = new JSONObject();
                json.put("parent_nodeRef", nodeRef.getId());
                json.put("nodeRef", v.getFrozenStateNodeRef().getId());

                String modifier = v.getFrozenModifier();
                String displayName = personBean.getDisplayName(modifier);
                if(displayName != null) {
                    json.put("modifier", displayName);
                }

                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                json.put("created", sdf.format(v.getFrozenModifiedDate()));

                json.put("version", v.getVersionLabel());

                result.add(json);
            }
        }

        return result;
    }

    public boolean isContent(NodeRef nodeRef) {
        QName type = nodeService.getType(nodeRef);
        return type.equals(ContentModel.TYPE_CONTENT);
    }

    public void updateProperties (NodeRef nodeRef, JSONObject propertiesObj) throws JSONException {
        Map<QName, Serializable> properties = getProperties(propertiesObj);
        nodeService.addProperties(nodeRef, properties);
    }

    private Map<QName, Serializable> getProperties(JSONObject propertiesObj) throws JSONException {
        Map<QName, Serializable> map = new HashMap<>();
        Iterator keys = propertiesObj.keys();
        while (keys.hasNext()) {
            String key = (String) keys.next();
            QName qName = QName.createQName(key, namespaceService);
            map.put(qName, propertiesObj.getString(key));
        }
        return map;
    }
}
