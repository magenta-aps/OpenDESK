// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.SiteGroup;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.ContentTransformer;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.rest.framework.core.exceptions.ApiException;
import org.alfresco.rest.framework.core.exceptions.NotFoundException;
import org.alfresco.service.cmr.favourites.FavouritesService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ISO9075;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Pair;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;

public class SiteBean {
    private AuthorityBean authorityBean;
    private ContentBean contentBean;
    private NotificationBean notificationBean;
    private PersonBean personBean;

    private ContentService contentService;
    private SearchService searchService;
    private SiteService siteService;
    private NodeService nodeService;
    private AuthorityService authorityService;
    private FavouritesService favouritesService;

    public void setAuthorityBean(AuthorityBean authorityBean) {
        this.authorityBean = authorityBean;
    }
    public void setContentBean(ContentBean contentBean) {
        this.contentBean = contentBean;
    }
    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }
    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }
    public void setFavouritesService(FavouritesService favouritesService) {
        this.favouritesService = favouritesService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    /**
     * Adds a link from one project to another.
     * @param sourceProject short name of the source project.
     * @param destinationProject short name of the destination project.
     * @return a JSONArray containing sourceLinkRef and destinationLinkRef that links to each other.
     */
    public void addLink(String sourceProject, String destinationProject) {
        SiteInfo source = siteService.getSite(sourceProject);
        SiteInfo destination = siteService.getSite(destinationProject);

        // Get the documentLibrary of the sites.
        NodeRef sourceDocumentLib = getDocumentLibraryRef(sourceProject);
        NodeRef destDocumentLib = getDocumentLibraryRef(destinationProject);

        // create link for source
        Map<QName, Serializable> linkProperties = new HashMap<>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(destination.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, destination.getShortName());
        ChildAssociationRef sourceChildRef = nodeService.createNode(sourceDocumentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);
        NodeRef sourceRef = sourceChildRef.getChildRef();

        // create link for destination
        linkProperties = new HashMap<>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(source.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, source.getShortName());
        ChildAssociationRef destinationChildRef = nodeService.createNode(destDocumentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);
        NodeRef destinationRef = destinationChildRef.getChildRef();


        // for easy deletion of the links, we do a save of the nodeRefs on each side
        nodeService.setProperty(sourceRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF, destinationRef);
        nodeService.setProperty(destinationRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF, sourceRef);
    }

    /**
     * Adds an authority to a site authority group.
     * @param siteShortName short name of a site.
     * @param authority authority.
     * @param group group name.
     */
    public void addMember(String siteShortName, String authority, String group) throws JSONException {

        String groupName = getAuthorityName(siteShortName, group);
        authorityService.addAuthority(groupName, authority);
        // Do not send notifications to a group
        if(authority.startsWith("GROUP"))
            notificationBean.notifySiteGroup(authority, siteShortName);
        else
            notificationBean.notifySiteMember(authority, siteShortName);
    }

    /**
     * Creates a container.
     * @param shortName of the parent site.
     * @param componentId component id of the container.
     */
    private void createContainer(String shortName, String componentId) {
        siteService.createContainer(shortName, componentId, ContentModel.TYPE_FOLDER, null);
    }

    /**
     * Creates a PDF containing information about the members of the site.
     * @param siteShortName short name of a site.
     * @return the nodeId of the PDF.
     */
    public String createMembersPDF(String siteShortName) throws JSONException {

        Map<String, String> groupNameMap = new HashMap<>();
        groupNameMap.put("PD_PROJECTOWNER" , "Projektejer");
        groupNameMap.put("PD_PROJECTMANAGER" , "Projektleder");
        groupNameMap.put("PD_PROJECTGROUP" , "Projektgruppe");
        groupNameMap.put("PD_WORKGROUP" , "Arbejdsgruppe");
        groupNameMap.put("PD_MONITORS" , "Følgegruppe");
        groupNameMap.put("PD_STEERING_GROUP" , "Styregruppe");

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            SiteInfo site = siteService.getSite(siteShortName);
            StringJoiner output = new StringJoiner("\n\n");
            output.add("Medlemsliste for projektet: " + site.getTitle() + "\n\n\n");

            // Print members
            NodeRef nodeRef = siteService.getSite(siteShortName).getNodeRef();
            String type = getSiteType(nodeRef);

            for (Object groupObject : getSiteGroups(type)) {
                JSONObject groupJSON = (JSONObject) groupObject;
                String shortName = groupJSON.getString("shortName");
                String displayName = groupNameMap.get(shortName);
                String members = getAuthorityMembersToString(siteShortName, shortName, displayName);
                output.add(members);
            }

            // delete the pdf if it is already present
            NodeRef documentLib = siteService.getContainer(site.getShortName(), OpenDeskModel.DOC_LIBRARY);
            NodeRef pdfNode = nodeService.getChildByName(documentLib, ContentModel.ASSOC_CONTAINS,
                    ISO9075.encode("Medlemsoversigt.pdf"));

            if (pdfNode != null) {
                nodeService.deleteNode(pdfNode);
            }

            // Create new PDF
            Map<QName, Serializable> documentLibaryProps = new HashMap<>();
            documentLibaryProps.put(ContentModel.PROP_NAME, "Medlemsoversigt.pdf");

            ChildAssociationRef child = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS,
                    QName.createQName(ContentModel.USER_MODEL_URI, "tempfile1"),
                    ContentModel.TYPE_CONTENT);

            ChildAssociationRef pdf = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS,
                    QName.createQName(ContentModel.USER_MODEL_URI, "thePDF"),
                    ContentModel.TYPE_CONTENT, documentLibaryProps);

            // hide the pdf from the users
            Map<QName, Serializable> aspectProps = new HashMap<>();
            nodeService.addAspect(pdf.getChildRef(), ContentModel.ASPECT_HIDDEN, aspectProps);

            // Write to the new PDF
            String outputString = output.toString();
            ContentWriter writer = contentService.getWriter(child.getChildRef(), ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
            writer.setEncoding("UTF-8");
            writer.putContent(outputString);

            writer = contentService.getWriter(pdf.getChildRef(), ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
            writer.putContent(outputString);

            ContentReader pptReader = contentService.getReader(child.getChildRef(), ContentModel.PROP_CONTENT);
            ContentWriter pdfWriter = contentService.getWriter(pdf.getChildRef(), ContentModel.PROP_CONTENT, true);
            ContentTransformer pptToPdfTransformer = contentService.getTransformer(MimetypeMap.MIMETYPE_TEXT_PLAIN,
                    MimetypeMap.MIMETYPE_PDF);

            pptToPdfTransformer.transform(pptReader, pdfWriter);

            nodeService.deleteNode(child.getChildRef());

            return pdf.getChildRef().getId();
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    /**
     * Creates a site with dashboard, document library and discussions.
     * @param displayName of the site.
     * @param description of the site.
     * @param siteVisibility of the site.
     * @return the nodeRef of the new site.
     */
    public NodeRef createSite(String displayName, String description, SiteVisibility siteVisibility) {
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
                createContainer(shortNameWithVersion, OpenDeskModel.DOC_LIBRARY);
                createContainer(shortNameWithVersion, OpenDeskModel.DISCUSSIONS);

                // Create site dashboard
                contentBean.createSiteDashboard(n, shortNameWithVersion);
            }
            catch(SiteServiceException e) {
                if(e.getMsgId().equals("site_service.unable_to_create"))
                    shortNameWithVersion = shortName + "-" + ++i;
            }
        }
        while(site == null);

        return site.getNodeRef();
    }

    public NodeRef createSite(String displayName, String description, String visibility) {
        SiteVisibility siteVisibility = getVisibility(visibility);
        if(siteVisibility == null)
            siteVisibility = SiteVisibility.PUBLIC;
        return createSite(displayName, description, siteVisibility);
    }

    /**
     * Creates a site group.
     * @param shortName short name of the site group.
     * @param authority of the group.
     * @param collapsed true if the group is possible to collapse.
     * @param multipleMembers true if the group can contain multiple members.
     * @return a JSONObject representing the site group.
     */
    private static JSONObject createSiteGroup(String shortName, String authority, boolean collapsed,
                                              boolean multipleMembers) {
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
     * Creates a site template.
     * @param displayName display name of the site template.
     * @param description description of the site template.
     * @return a JSONObject representing the site template.
     */
    public JSONObject createTemplate(String displayName, String description) throws JSONException {

        NodeRef nodeRef = createSite(displayName, description, SiteVisibility.PUBLIC);
        makeSiteATemplate(nodeRef);
        return getSiteInfo(nodeRef);
    }

    /**
     * Deletes a link.
     * @param source nodeRef of source link.
     * @param destination nodeRef of destination link.
     */
    public void deleteLink(NodeRef source, NodeRef destination) {

        nodeService.deleteNode(source);
        nodeService.deleteNode(destination);
    }

    public void deleteLink(String sourceSiteShortName, String destinationSiteShortName) {
        NodeRef sourceSiteLink = getLink(sourceSiteShortName, destinationSiteShortName);
        NodeRef destinationSiteLink = getDestinationLink(sourceSiteLink);

        if(sourceSiteLink != null) {
            nodeService.deleteNode(sourceSiteLink);
        }
        if(destinationSiteLink != null) {
            nodeService.deleteNode(destinationSiteLink);
        }
    }

    public NodeRef getLink(String sourceSiteShortName, String destinationSiteShortName) {
        NodeRef sourceDocLibRef = getDocumentLibraryRef(sourceSiteShortName);
        QName targetProp = OpenDeskModel.PROP_LINK_TARGET;
        List<ChildAssociationRef> childAssocs =
                nodeService.getChildAssocsByPropertyValue(sourceDocLibRef, targetProp, destinationSiteShortName);

        if(childAssocs.size() > 0) {
            return childAssocs.get(0).getChildRef();
        }
        return null;
    }

    public NodeRef getDestinationLink(NodeRef sourceSiteLink) {
        if (sourceSiteLink != null) {
            Serializable targetStr = nodeService.getProperty(sourceSiteLink, OpenDeskModel.PROP_LINK_TARGET_NODEREF);
            return new NodeRef(targetStr.toString());
        }
        return null;
    }

    /**
     * Deletes a site.
     * @param siteShortName short name of a site.
     */
    public void deleteSite(String siteShortName) {
        // Find all links pointing from this site
        NodeRef documentLibrary = siteService.getContainer(siteShortName, SiteService.DOCUMENT_LIBRARY);

        Set<QName> childNodeTypeQNames = new HashSet<>(Collections.singletonList(OpenDeskModel.PROP_LINK));
        List<ChildAssociationRef> childAssocs = nodeService.getChildAssocs(documentLibrary, childNodeTypeQNames);

        // Delete the counterpart links linking to this site
        for (ChildAssociationRef assoc : childAssocs) {
            NodeRef n = assoc.getChildRef();
            if (n != null) {
                String query = "TYPE:\"od:link\" AND @od\\:targetproject_noderef:\"" + n + "\"";
                StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
                ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);
                NodeRef ln = siteSearchResult.getNodeRef(0);
                nodeService.deleteNode(ln);
            }
        }

        // Delete the site n
        siteService.deleteSite(siteShortName);

        // Delete all groups/authorities of the site
        String authority = getAuthorityName(siteShortName, "");
        authorityService.deleteAuthority(authority, true);
    }

    public JSONArray getAuthorities(String siteShortName, int maxItems, int skipCount) throws JSONException {
        return getAuthorityGroups(siteShortName, true, maxItems, skipCount);
    }

    private List<String> getAuthorityList(String siteShortName, boolean authorities) throws JSONException {
        String siteType = getSiteType(siteShortName);
        List<String> result = new ArrayList<>();
        for (Object groupObject : getSiteGroups(siteType)) {
            JSONObject groupJSON = (JSONObject) groupObject;
            String groupAuthorityName = getAuthorityName(siteShortName, groupJSON.getString("shortName"));
            if(authorities){
                List<String> authorityList = authorityBean
                        .getAuthorityList(groupAuthorityName, Integer.MAX_VALUE, 0)
                        .getFirst();
                result.addAll(authorityList);
            }
            else {
                List<String> authorityList = authorityBean
                        .getUserList(groupAuthorityName, Integer.MAX_VALUE, 0)
                        .getFirst();
                result.addAll(authorityList);
            }
        }
        return result;
    }

    /**
     * Gets authority members as a double line break separated string.
     * Used by createMembersPDF
     * @param siteShortName short name of a site.
     * @param groupShortName group name.
     * @return group members.
     */
    private String getAuthorityMembersToString(String siteShortName, String groupShortName, String groupDisplayName) {
        String group = getAuthorityName(siteShortName, groupShortName);
        StringJoiner groupMembers = new StringJoiner("\n");
        groupMembers.add(groupDisplayName + ": \n");
        Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);
        for (String authority : authorities) {
            String displayName = personBean.getDisplayName(authority);
            groupMembers.add(displayName);
        }
        return groupMembers.toString();
    }


    /**
     * Gets the authority name of a site group.
     * @param siteShortName of the site that the group belongs to.
     * @param groupName of the site group.
     * @return the authority name of the site group.
     */
    public String getAuthorityName (String siteShortName, String groupName)
    {
        String siteGroup = "GROUP_site_" + siteShortName;
        if("".equals(groupName))
            return siteGroup;
        else
            return siteGroup + "_" + groupName;
    }

    public NodeRef getDocumentLibraryRef(SiteInfo siteInfo) {
        return getDocumentLibraryRef(siteInfo.getShortName());
    }

    public NodeRef getDocumentLibraryRef(String siteShortName) {
        return siteService.getContainer(siteShortName, OpenDeskModel.DOC_LIBRARY);
    }

    /**
     * Gets the role of the current user in a site.
     * @param siteShortName short name of a site.
     * @return a JSONArray containing role.
     */
    public String getRole(String siteShortName) {
        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        Map<String, Boolean> authorities = new HashMap<>();
        authorities.put(OpenDeskModel.MANAGER, false);
        authorities.put(OpenDeskModel.COLLABORATOR, false);
        authorities.put(OpenDeskModel.CONTRIBUTOR, false);
        authorities.put(OpenDeskModel.CONSUMER, false);

        for (Map.Entry<String, Boolean> authority : authorities.entrySet()) {
            String group = getAuthorityName(siteShortName, "Site" + authority.getKey());
            Set<String> tempAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, false);
            if (tempAuthorities.contains(userName))
                authority.setValue(true);
        }

        String role;
        if (authorities.get(OpenDeskModel.MANAGER)) {
            role = OpenDeskModel.MANAGER;

            NodeRef n = siteService.getSite(siteShortName).getNodeRef();

            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {
                String projectOwnerGroup = getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                Set<String> tempAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectOwnerGroup, true);
                if (tempAuthorities.contains(userName))
                    role = OpenDeskModel.OWNER;
            }
        } else if (authorities.get(OpenDeskModel.COLLABORATOR) || authorities.get(OpenDeskModel.CONTRIBUTOR)) {
            role = OpenDeskModel.COLLABORATOR;
        } else if (authorities.get(OpenDeskModel.CONSUMER)) {
            role = OpenDeskModel.CONSUMER;
        } else
            role = OpenDeskModel.OUTSIDER;

        return role;
    }

    /**
     * Gets all groups of a site and their members.
     * @param siteShortName short name of a site.
     * @param authorities the method returns groups if this is true and users otherwise.
     * @param maxItems the maximum number of items to return (used for paging).
     * @param skipCount the offset to use for returning the list of users (used for paging).
     * @return JSONArray of JSONObjects for each group and each of their members.
     */
    private JSONArray getAuthorityGroups(String siteShortName, boolean authorities, int maxItems,
                                         int skipCount) throws JSONException {

        String siteType = getSiteType(siteShortName);
        JSONArray result = new JSONArray();

        for (Object groupObject : getSiteGroups(siteType)) {

            JSONObject groupJSON = (JSONObject) groupObject;
            String groupAuthorityName = getAuthorityName(siteShortName, groupJSON.getString("shortName"));

            Pair<JSONArray, Integer> membersAndTotalCount;
            if(authorities) {
                membersAndTotalCount = authorityBean.getAuthorities(groupAuthorityName, maxItems, skipCount);
            } else {
                membersAndTotalCount = authorityBean.getUsers(groupAuthorityName, maxItems, skipCount);
            }
            groupJSON.put("members", membersAndTotalCount.getFirst());
            groupJSON.put("totalMembersCount", membersAndTotalCount.getSecond());
            result.add(groupJSON);

        }

        return result;
    }

    /**
     * Gets all groups of a type of site.
     * @param siteType type of site.
     * @return a JSONArray containing a JSONObject for each group.
     */
    public JSONArray getSiteGroups(String siteType) {
        // TODO: use strategy pattern instead af a parametric solution for handling variability
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
            default:
                // TODO: handle this case with a checked exception instead
                result = null;
        }
        return result;
    }

    /**
     * Gets information of a site.
     * @param nodeRef nodeRef of the site.
     * @return a JSONObject representing the site.
     */
    public JSONObject getSiteInfo(NodeRef nodeRef) throws JSONException {
        SiteInfo siteInfo = siteService.getSite(nodeRef);
        return getSiteInfo(siteInfo);
    }

    /**
     * Converts a site into a standard structured JSONObject.
     * @param s site info.
     * @return a JSONObject representing the site.
     */
    private JSONObject getSiteInfo(SiteInfo s) throws JSONException {
        JSONObject json = new JSONObject();
        String siteShortName = s.getShortName();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        json.put("created", sdf.format(s.getCreatedDate()));
        json.put("modified", sdf.format(s.getLastModifiedDate()));

        json.put("shortName", siteShortName);
        json.put("visibility", s.getVisibility());

        String role = getRole(siteShortName);
        json.put("current_user_role", role);

        NodeRef n = s.getNodeRef();
        json.put("nodeId", n.getId());
        json.put("nodeRef", n.toString());
        NodeRef documentLibraryRef = getDocumentLibraryRef(s);
        json.put("documentLibraryId", documentLibraryRef.getId());

        String userName = AuthenticationUtil.getFullyAuthenticatedUser();
        boolean isFavourite = favouritesService.isFavourite(userName, n);
        json.put("isFavourite", isFavourite);

        String manager = "";
        String owner = "";

        boolean notTemplateSite = true;

        if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES) || nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_DOCUMENT)) {
            notTemplateSite = false;
        }

        if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {
            json.put("title", nodeService.getProperty(n, OpenDeskModel.PROP_PD_NAME));
            json.put("description", nodeService.getProperty(n, OpenDeskModel.PROP_PD_DESCRIPTION));
            json.put("type", OpenDeskModel.pd_project);
            json.put("state", nodeService.getProperty(n, OpenDeskModel.PROP_PD_STATE));
            String centerID = (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_CENTERID);
            json.put("center_id", centerID);
            String centerName = authorityService.getAuthorityDisplayName("GROUP_" + centerID);
            json.put("center_name", centerName);
            json.put("sbsys", nodeService.getProperty(n, OpenDeskModel.PROP_PD_SBSYS));
            json.put("notTemplateSite", true); // only pd_sites can be used as templateSites

            String projectManagerGroup = getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectManagerGroup, true);
            if (authorities.iterator().hasNext())
                manager = authorities.iterator().next();

            String projectOwnerGroup = getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
            authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectOwnerGroup, true);
            if (authorities.iterator().hasNext())
                owner = authorities.iterator().next();
        } else {
            json.put("title", s.getTitle());
            json.put("description", s.getDescription());
            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES))
                json.put("type", OpenDeskModel.template_project);

            else if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_DOCUMENT))
                json.put("type", OpenDeskModel.template_project);
            else
                json.put("type", OpenDeskModel.project);


            json.put("state", "");
            json.put("center_id", "");
            json.put("center_name", "");
            json.put("sbsys", "");
            json.put("notTemplateSite", notTemplateSite);

            String SiteManager = getAuthorityName(siteShortName, "SiteManager");
            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteManager, true);
            if (authorities.iterator().hasNext())
                manager = authorities.iterator().next();
        }

        //Get Manager
        if (!manager.isEmpty()) {
            JSONObject managerObj = personBean.getPersonInfo(manager);
            if(managerObj != null)
                json.put("manager", managerObj);
        }

        //Get Owner
        if (!owner.isEmpty()) {
            JSONObject ownerObj = personBean.getPersonInfo(owner);
            if(ownerObj != null)
                json.put("owner", ownerObj);
        }

        //Get Creator
        String creator = nodeService.getProperty(n, ContentModel.PROP_CREATOR).toString();
        JSONObject creatorObj = personBean.getPersonInfo(creator);
        if(creatorObj != null)
            json.put("creator", creatorObj);

        //Get Member list
        JSONArray membersArray = new JSONArray();
        String group = getAuthorityName(siteShortName, "");
        Set<String> members = authorityService.getContainedAuthorities(AuthorityType.USER, group, false);

        membersArray.addAll(members);
        json.put("members", membersArray);

        return json;
    }

    /**
     * Gets information of a site.
     * @param shortName short name of the site.
     * @return a JSONObject representing the site.
     */
    public JSONObject getSiteInfo(String shortName) throws JSONException {
        SiteInfo siteInfo = siteService.getSite(shortName);
        return getSiteInfo(siteInfo);
    }

    /**
     * Gets the type of a site.
     * @param nodeRef of the site.
     * @return the type of the site.
     */
    private String getSiteType(NodeRef nodeRef) {
        String type = OpenDeskModel.project;
        if (nodeService.hasAspect(nodeRef, OpenDeskModel.ASPECT_PD)) {
            type = OpenDeskModel.pd_project;
        }
        return type;
    }

    /**
     * Gets the type of a site
     * @param siteShortName shortname of a site.
     * @return a JSONArray containing type.
     */
    private String getSiteType(String siteShortName) {

        NodeRef nodeRef = siteService.getSite(siteShortName).getNodeRef();
        return getSiteType(nodeRef);
    }

    /**
     * Gets all sites that the current user is explicitly part of.
     * @return a JSONArray containing JSONObjects of all sites that the current user is explicitly part of.
     */
    public JSONArray getSites() throws JSONException {
        JSONArray result = new JSONArray();
        String user = AuthenticationUtil.getFullyAuthenticatedUser();
        List<SiteInfo> currentUserSites = siteService.listSites(user);

        for (SiteInfo siteInfo : currentUserSites) {
            if (isSiteSpecial(siteInfo))
                continue;
            JSONObject json = getSiteInfo(siteInfo);
            result.add(json);
        }

        return result;
    }

    /**
     * Gets all sites with a certain aspect.
     * @param aspect aspect to filter by.
     * @return a JSONArray containing JSONObjects for each site.
     */
    private JSONArray getSitesWithAspect(QName aspect) throws JSONException {

        NodeRef sitesNodeRef = siteService.getSiteRoot();

        JSONArray result = new JSONArray();
        List<ChildAssociationRef> children = nodeService.getChildAssocs(sitesNodeRef);
        for (ChildAssociationRef child : children) {
            NodeRef childRef = child.getChildRef();
            if (nodeService.hasAspect(childRef, aspect))
            {
                SiteInfo s = siteService.getSite(childRef);
                JSONObject json = getSiteInfo(s);
                result.add(json);
            }
        }
        return result;
    }

    /**
     * Gets all site templates.
     * (method = getTemplates)
     * @return a JSONArray containing JSONObjects for each site template.
     */
    public JSONArray getTemplates() throws JSONException {
        return getSitesWithAspect(OpenDeskModel.ASPECT_PD_TEMPLATE_SITES);
    }

    /**
     * Gets all groups of a site and their members.
     * @param siteShortName short name of a site.
     * @param maxItems the maximum number of items to return (used for paging).
     * @param skipCount the offset to use for returning the list of users (used for paging).
     * @param flatten list of users will be flattened (used for paging) if set to true.
     * @return JSONArray of JSONObjects for each group and each of their members
     */
    public JSONArray getUsers(String siteShortName, int maxItems, int skipCount, boolean flatten) throws JSONException {
        if (flatten) {
            String groupAuthorityName = getAuthorityName(siteShortName, "");

            Pair<JSONArray, Integer> membersAndTotalCount = authorityBean.getUsers(groupAuthorityName, maxItems, skipCount);

            JSONObject groupJSON = new JSONObject();
            groupJSON.put("members", membersAndTotalCount.getFirst());
            groupJSON.put("totalMembersCount", membersAndTotalCount.getSecond());
            for (Object m : membersAndTotalCount.getFirst()) {
                JSONObject member = (JSONObject) m;
                SiteGroup siteGroup = authorityBean.getTopAuthorityForUser(member.getString("userName"), siteShortName);
                member.put("topAuthority", siteGroup.toString());
                member.put("authorityOrdinal", siteGroup.ordinal());
            }
            JSONArray result = new JSONArray();  // Wrap the result in an array to be consistent with the code elsewhere
            result.add(groupJSON);

            return result;

        } else {
            return getAuthorityGroups(siteShortName, false, maxItems, skipCount);
        }
    }

    /**
     * Gets the visibility enum from a string.
     * @param visibility a string representing the visibility.
     * @return an enum representing the visibility.
     */
    public SiteVisibility getVisibility(String visibility)
    {
        if(visibility.isEmpty())
            return null;
        else
            return SiteVisibility.valueOf(visibility);
    }

    public JSONArray searchAuthorities(String siteShortName, String filter) throws JSONException {
        List<String> authorities = getAuthorityList(siteShortName, true);
        List<String> users = getAuthorityList(siteShortName, false);
        authorities.addAll(users);
        return authorityBean.findAuthorities(filter, authorities);
    }

    public JSONArray searchUsers(String siteShortName, String filter) throws JSONException {
        List<String> authorities = getAuthorityList(siteShortName, true);
        List<String> users = getAuthorityList(siteShortName, false);
        authorities.addAll(users);
        return authorityBean.findUsers(filter, authorities);
    }

    /**
     * Checks if a site is special.
     * A site is special if it has aspects; 'projecttype_templates' or 'document_template'.
     * @param siteInfo of the site.
     * @return true if the site is special. False if the site is not special.
     */
    private boolean isSiteSpecial(SiteInfo siteInfo) {
        NodeRef n = siteInfo.getNodeRef();
        return nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES) ||
                nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_DOCUMENT);
    }

    /**
     * Makes a site into a site template.
     * @param nodeRef of the site to be made into a site template.
     */
    private void makeSiteATemplate(NodeRef nodeRef) {
        Map<QName, Serializable> aspectProps = new HashMap<>();
        nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES, aspectProps);
    }

    /**
     * Removes an authority from an site authority group.
     * @param siteShortName short name of a site.
     * @param authority authority.
     * @param group group name.
     */
    public void removeMember(String siteShortName, String authority, String group) {

        String groupName = getAuthorityName(siteShortName, group);
        authorityService.removeAuthority(groupName, authority);
    }

    /**
     * Finds all sites based on a search query.
     * @param q search query. Leave this blank to get all sites.
     * @return a JSONArray containing JSONObjects of all sites.
     */
    public JSONArray searchSites(String q) throws JSONException {
        if(q == null)
            q = "";
        JSONArray result = new JSONArray();

        List<SiteInfo> allSites = siteService.listSites(q, q);

        for (SiteInfo siteInfo : allSites) {
            String siteShortName = siteInfo.getShortName();
            String role = getRole(siteShortName);
            if (SiteVisibility.PUBLIC.equals(siteInfo.getVisibility()) || !OpenDeskModel.OUTSIDER.equals(role)) {
                JSONObject json = getSiteInfo(siteInfo);
                if (isSiteSpecial(siteInfo))
                    continue;
                result.add(json);
            }
        }

        return result;
    }
}
