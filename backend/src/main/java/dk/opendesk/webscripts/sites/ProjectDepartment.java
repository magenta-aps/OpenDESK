/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package dk.opendesk.webscripts.sites;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.repository.*;
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
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ProjectDepartment extends AbstractWebScript {

    private PermissionService permissionService;
    private SearchService searchService;
    private CopyService copyService;
    private AuthenticationService authenticationService;
    private ContentService contentService;
    private SiteService siteService;
    private NodeService nodeService;
    private AuthorityService authorityService;

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    public void setCopyService(CopyService copyService) {
        this.copyService = copyService;
    }
    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
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

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String site_name = Utils.getJSONObject(json, "PARAM_NAME");
            String site_short_name = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");
            String site_description = Utils.getJSONObject(json, "PARAM_DESCRIPTION");
            String site_sbsys = Utils.getJSONObject(json, "PARAM_SBSYS");
            String site_owner = Utils.getJSONObject(json, "PARAM_OWNER");
            String site_manager = Utils.getJSONObject(json, "PARAM_MANAGER");
            String site_state = Utils.getJSONObject(json, "PARAM_STATE");
            String site_center_id = Utils.getJSONObject(json, "PARAM_CENTERID");
            String site_visibility_str = Utils.getJSONObject(json, "PARAM_VISIBILITY");
            String template = Utils.getJSONObject(json, "PARAM_TEMPLATE");
            SiteVisibility site_visibility = Utils.getVisibility(site_visibility_str);

            switch (method) {
                case "createPDSITE":
                    result = createPDSite(site_name, site_description, site_sbsys, site_center_id, site_owner,
                            site_manager, site_visibility, template);
                    break;
                case "updatePDSITE":
                    result = updatePDSite(site_short_name, site_name, site_description,
                            site_sbsys, site_center_id, site_owner, site_manager, site_state, site_visibility);
                    break;
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    /**
     * Applies a template to a site.
     * @param newSiteRef nodeRef of the site.
     * @param template_name name of the template.
     */
    private void executeTemplate(NodeRef newSiteRef, String template_name) {

        System.out.println(template_name);

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, "ASPECT:\"od:projecttype_templates\" AND @cm\\:name:\"" + template_name + "\"");

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
     * (method = createPDSITE)
     * @param site_name name of the project.
     * @param site_description description of the project.
     * @param site_sbsys sbsys id of the project.
     * @param site_center_id center id of the project.
     * @param site_owner project owner.
     * @param site_manager project manager.
     * @param site_visibility project visibility.
     * @param template template to apply on the project.
     * @return a JSONArray containing nodeRef and shortName of site.
     */
    private JSONArray createPDSite(String site_name, String site_description, String site_sbsys, String site_center_id,
                                   String site_owner, String site_manager, SiteVisibility site_visibility, String template) {

        if(site_visibility == null)
            site_visibility = SiteVisibility.PUBLIC;

        JSONArray result = new JSONArray();
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            NodeRef newSiteRef = Utils.createSite(nodeService, contentService, siteService, site_name,
                    site_description, site_visibility);
            updateSite(newSiteRef , site_name, site_description, site_sbsys, site_center_id, OpenDeskModel.STATE_ACTIVE);

            String creator = authenticationService.getCurrentUserName();
            createGroupAddMembers(newSiteRef, site_owner, site_manager, creator);

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
     * (method = updatePDSITE)
     * @param site_short_name short name of the project.
     * @param site_name name of the project.
     * @param site_description description of the project.
     * @param site_sbsys sbsys id of the project.
     * @param site_center_id center id of the project.
     * @param site_owner project owner.
     * @param site_manager project manager.
     * @param site_state project state.
     * @param site_visibility project visibility.
     * @return JSONSuccess.
     */
    private JSONArray updatePDSite(String site_short_name, String site_name, String site_description, String site_sbsys,
                                   String site_center_id, String site_owner, String site_manager, String site_state,
                                   SiteVisibility site_visibility) {

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            SiteInfo site = siteService.getSite(site_short_name);
            NodeRef nodeRef = site.getNodeRef();

            if(site_visibility != null)
                nodeService.setProperty(nodeRef, SiteModel.PROP_SITE_VISIBILITY, site_visibility);

            updateSite(nodeRef, site_name, site_description, site_sbsys, site_center_id, site_state);


            if(!site_owner.isEmpty()) {
                String ownerGroup = Utils.getAuthorityName(site_short_name, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                updateSingleGroupMember(ownerGroup, site_owner);
            }

            if(!site_manager.isEmpty()) {
                String managerGroup = Utils.getAuthorityName(site_short_name, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
                updateSingleGroupMember(managerGroup, site_manager);
            }

        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONSuccess();
    }

    /**
     * Updates the site with Project properties.
     * @param nodeRef nodeRef of the site.
     * @param name name of the site.
     * @param description description of the site.
     * @param sbsys sbsys id of the site.
     * @param center_id center id of the site.
     * @param state state of the site.
     */
    private void updateSite(NodeRef nodeRef, String name, String description, String sbsys, String center_id, String state) {

        // add the projectdepartment aspect
        Map<QName, Serializable> aspectProps = new HashMap<>();
        aspectProps.put(OpenDeskModel.PROP_PD_NAME, name);
        aspectProps.put(OpenDeskModel.PROP_PD_DESCRIPTION, description);
        aspectProps.put(OpenDeskModel.PROP_PD_SBSYS, sbsys);
        aspectProps.put(OpenDeskModel.PROP_PD_STATE, state);
        aspectProps.put(OpenDeskModel.PROP_PD_CENTERID, center_id);

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

        for (Object groupObject :  Utils.siteGroups.get(OpenDeskModel.pd_project)) {

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