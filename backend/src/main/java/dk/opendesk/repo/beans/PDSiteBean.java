package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.repository.CopyService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class PDSiteBean {
    private SiteBean siteBean;

    private PermissionService permissionService;
    private SearchService searchService;
    private CopyService copyService;
    private AuthenticationService authenticationService;
    private SiteService siteService;
    private NodeService nodeService;
    private AuthorityService authorityService;

    public void setSiteBean(SiteBean siteBean) {
        this.siteBean = siteBean;
    }

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    public void setCopyService(CopyService copyService) {
        this.copyService = copyService;
    }
    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    /**
     * Applies a template to a site.
     * @param newSiteRef nodeRef of the site.
     * @param template_name name of the template.
     */
    private void executeTemplate(NodeRef newSiteRef, String template_name) {
        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        String query = "ASPECT:\"od:projecttype_templates\" AND @cm\\:name:\"" + template_name + "\"";
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);
        if (siteSearchResult.length() > 0) {
            NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
            SiteInfo templateSite = siteService.getSite(siteNodeRef);
            SiteInfo newSite = siteService.getSite(newSiteRef);
            // Get the documentLibrary of the template site.
            NodeRef templateDocLib = siteService.getContainer(templateSite.getShortName(), OpenDeskModel.DOC_LIBRARY);
            // Get the documentLibrary of the new site.
            NodeRef newSiteDocLib = siteService.getContainer(newSite.getShortName(), OpenDeskModel.DOC_LIBRARY);
            copyService.copy(templateDocLib, newSiteDocLib);
        }
    }

    /**
     * Creates a Project Department site aka. Project
     * @param name name of the project.
     * @param description description of the project.
     * @param sbsys sbsys id of the project.
     * @param centerId center id of the project.
     * @param owner project owner.
     * @param manager project manager.
     * @param visibility project visibility.
     * @param template template to apply on the project.
     * @return a JSONArray containing nodeRef and shortName of site.
     */
    public JSONArray createPDSite(String name, String description, String sbsys, String centerId,
                                   String owner, String manager, String visibility, String template) {
        JSONArray result = new JSONArray();
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            NodeRef newSiteRef = siteBean.createSite(name, description, visibility);
            updateSite(newSiteRef , name, description, sbsys, centerId, OpenDeskModel.STATE_ACTIVE);

            String creator = authenticationService.getCurrentUserName();
            createGroupAddMembers(newSiteRef, owner, manager, creator);

            if (!"".equals(template)) {
                this.executeTemplate(newSiteRef, template);
            }

            JSONObject return_json = new JSONObject();
            return_json.put("nodeRef", newSiteRef);
            return_json.put("shortName", siteService.getSiteShortName(newSiteRef));

            result.add(return_json);

        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return result;
    }

    /**
     * Updates a Project Department site aka. Project
     * @param siteShortName short name of the project.
     * @param name name of the project.
     * @param description description of the project.
     * @param sbsys sbsys id of the project.
     * @param centerId center id of the project.
     * @param owner project owner.
     * @param manager project manager.
     * @param state project state.
     * @param visibility project visibility.
     */
    public void updatePDSite(String siteShortName, String name, String description, String sbsys, String centerId,
                             String owner, String manager, String state, String visibility) {
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            SiteInfo site = siteService.getSite(siteShortName);
            NodeRef nodeRef = site.getNodeRef();

            SiteVisibility siteVisibility = siteBean.getVisibility(visibility);
            if(siteVisibility != null)
                nodeService.setProperty(nodeRef, SiteModel.PROP_SITE_VISIBILITY, siteVisibility);

            updateSite(nodeRef, name, description, sbsys, centerId, state);


            if(!owner.isEmpty()) {
                String ownerGroup = siteBean.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                updateSingleGroupMember(ownerGroup, owner);
            }

            if(!manager.isEmpty()) {
                String managerGroup = siteBean.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
                updateSingleGroupMember(managerGroup, manager);
            }

        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    /**
     * Updates the site with Project properties.
     * @param nodeRef nodeRef of the site.
     * @param name name of the site.
     * @param description description of the site.
     * @param sbsys sbsys id of the site.
     * @param centerId center id of the site.
     * @param state state of the site.
     */
    private void updateSite(NodeRef nodeRef, String name, String description, String sbsys, String centerId,
                            String state) {
        // add the projectdepartment aspect
        Map<QName, Serializable> aspectProps = new HashMap<>();
        aspectProps.put(OpenDeskModel.PROP_PD_NAME, name);
        aspectProps.put(OpenDeskModel.PROP_PD_DESCRIPTION, description);
        aspectProps.put(OpenDeskModel.PROP_PD_SBSYS, sbsys);
        aspectProps.put(OpenDeskModel.PROP_PD_STATE, state);
        aspectProps.put(OpenDeskModel.PROP_PD_CENTERID, centerId);
        nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_PD, aspectProps);
    }

    /**
     * Updates group that can only contain one member.
     * It deletes all other members and adds the user as new sole member.
     * @param group short name of the group.
     * @param userName of the member.
     */
    private void updateSingleGroupMember(String group, String userName) {

        //Clear group
        Set<String> members = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);
        for (String member : members)
            authorityService.removeAuthority(group, member);

        //Add member
        authorityService.addAuthority(group, userName);
    }

    /**
     * Creates Project Department groups and add owner and manager to it.
     * @param nodeRef of the project.
     * @param owner project owner.
     * @param manager project manager.
     * @param creator project creator.
     */
    private void createGroupAddMembers(NodeRef nodeRef, String owner, String manager, String creator)
            throws JSONException {

        String siteShortName = siteService.getSiteShortName(nodeRef);
        String groupPrefix = "site_" + siteShortName + "_";
        String authorityPrefix = "GROUP_" + groupPrefix;

        for (Object groupObject :  siteBean.getSiteGroups(OpenDeskModel.pd_project)) {

            JSONObject groupJSON = (JSONObject) groupObject;
            String shortName = groupJSON.getString("shortName");

            String groupAuthority = authorityService.createAuthority(AuthorityType.GROUP, groupPrefix + shortName);
            String authority = groupJSON.getString("authority");

            authorityService.addAuthority(authorityPrefix + authority,  groupAuthority);
        }

        // allow all other project owners to access this project
        permissionService.setPermission(nodeRef, OpenDeskModel.PROJECT_OWNERS, OpenDeskModel.SITE_COLLABORATOR,
                true);

        // Add Owner and Manager to their groups
        authorityService.addAuthority(authorityPrefix + OpenDeskModel.PD_GROUP_PROJECTOWNER, owner);
        authorityService.addAuthority(authorityPrefix + OpenDeskModel.PD_GROUP_PROJECTMANAGER, manager);

        //Remove Project creator from SiteManager-group
        authorityService.removeAuthority(authorityPrefix + OpenDeskModel.SITE_MANAGER, creator);
    }
}
