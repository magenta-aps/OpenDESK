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
import org.alfresco.model.ContentModel;
import org.alfresco.repo.domain.permissions.Authority;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;

import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.*;

import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;

import java.io.Writer;
import java.util.*;

public class ProjectDepartment extends AbstractWebScript {

    private PermissionService permissionService;

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }

    private SearchService searchService;

    public void setCopyService(CopyService copyService) {
        this.copyService = copyService;
    }


    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }

    FileFolderService fileFolderService;

    private CopyService copyService;

    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    AuthenticationService authenticationService;


    public class CustomComparator implements Comparator<SiteInfo> {
        @Override
        public int compare(SiteInfo o1, SiteInfo o2) {
            return o1.getTitle().compareTo(o2.getTitle());
        }
    }

    private SiteService siteService;
    private NodeService nodeService;
    private PersonService personService;
    private AuthorityService authorityService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;

    } public void setPermissionService(PermissionService permissionService) {
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
            SiteVisibility site_visibility;
            if(site_visibility_str.isEmpty())
                site_visibility = null;
            else
                site_visibility = SiteVisibility.valueOf(site_visibility_str);

            switch (method) {
                case "createPDSITE":
                    result = createPDSite(site_name, site_description, site_sbsys, site_center_id, site_owner,
                            site_manager, site_visibility, template);
                    break;
                case "updatePDSITE":
                    result = updatePDSite(site_short_name, site_name, site_description,
                            site_sbsys, site_center_id, site_owner, site_manager, site_state, site_visibility);
                    break;
                case "addTemplate":
                    break;
            }
        }
        catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
            result = Utils.getJSONError(e);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }


    private void executeTemplate(NodeRef newSiteRef, String template_name) {

        System.out.println(template_name);

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, "ASPECT:\"od:projecttype_templates\" AND @cm\\:name:\"" + template_name + "\"");

        if (siteSearchResult.length() > 0) {

            NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
            SiteInfo templateSite = siteService.getSite(siteNodeRef);
            SiteInfo newSiteInfo = siteService.getSite(newSiteRef);

            // Get the documentLibrary of the template site.
            NodeRef template_documentlibrary = siteService.getContainer(templateSite.getShortName(), "documentlibrary");

            // Get the documentLibrary of the new site.
            NodeRef newSite_documentlibrary = siteService.getContainer(newSiteInfo.getShortName(), "documentlibrary");

             nodeService.deleteNode(newSite_documentlibrary);

            try {
                fileFolderService.copy(template_documentlibrary, newSiteRef, "documentLibrary");
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }

    }

    private JSONArray createPDSite(String site_name, String site_description, String site_sbsys, String site_center_id,
                                   String site_owner, String site_manager, SiteVisibility site_visibility, String template) {

        if(site_visibility == null)
            site_visibility = SiteVisibility.PUBLIC;

        JSONArray result = new JSONArray();
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            NodeRef newSiteRef = Utils.createSite(nodeService, siteService, site_name, site_description, site_visibility);
            updateSite(newSiteRef , site_name, site_description, site_sbsys, site_center_id, OpenDeskModel.STATE_ACTIVE);

            String creator = authenticationService.getCurrentUserName();
            createGroupAddMembers(newSiteRef, site_owner, site_manager, creator);

            if (!"".equals(template)) {
                this.executeTemplate(newSiteRef, template);
            }

            JSONObject return_json = new JSONObject();

            return_json.put("status", "success");
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
                String ownerGroup = Utils.getPDGroupName(site_short_name, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                updateSingleGroupMember(ownerGroup, site_owner);
            }

            if(!site_manager.isEmpty()) {
                String managerGroup = Utils.getPDGroupName(site_short_name, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
                updateSingleGroupMember(managerGroup, site_manager);
            }

        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONSuccess();
    }

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

    private void updateSingleGroupMember(String group, String userName) {

        //Clear group
        Set<String> members = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);
        for (String member : members)
            authorityService.removeAuthority(group, member);

        //Add member
        authorityService.addAuthority(group, userName);
    }

    private void createGroupAddMembers(NodeRef nodeRef, String owner, String site_manager, String creator) {

        String siteShortName = siteService.getSiteShortName(nodeRef);
        String prefix = "site_" + siteShortName + "_";
        String projectowner = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_PROJECTOWNER);
        String projectmanager = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_PROJECTMANAGER);
        String monitors = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_MONITORS);
        String projectgroup = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_PROJECTGROUP);
        String workgroup = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_WORKGROUP);
        String steeringgroup = authorityService.createAuthority(AuthorityType.GROUP, prefix + OpenDeskModel.PD_GROUP_STEERING_GROUP);

        /*
            Setup permissions
            Consumer - can read content
            Contributor - can create and upload content
            Editor - can read and update content
            Collaborator - can do everything except moving and deleting other users content
            Coordinator - full access
         */

        Map<String, String> authorities = new HashMap<>();
        authorities.put(OpenDeskModel.MANAGER, "");
        authorities.put(OpenDeskModel.COLLABORATOR, "");
        authorities.put(OpenDeskModel.CONTRIBUTOR, "");
        authorities.put(OpenDeskModel.CONSUMER, "");

        for (Map.Entry<String, String> authority : authorities.entrySet()) {
            authority.setValue("GROUP_site_" + siteShortName + "_Site" + authority.getKey());
        }

        authorityService.addAuthority(authorities.get(OpenDeskModel.MANAGER), projectmanager);

        authorityService.addAuthority(authorities.get(OpenDeskModel.COLLABORATOR), projectowner);
        authorityService.addAuthority(authorities.get(OpenDeskModel.COLLABORATOR), projectgroup);
        authorityService.addAuthority(authorities.get(OpenDeskModel.COLLABORATOR), workgroup);

        authorityService.addAuthority(authorities.get(OpenDeskModel.CONSUMER), steeringgroup);
        authorityService.addAuthority(authorities.get(OpenDeskModel.CONSUMER), monitors);

        // allow all other projectmanagers to access this project
        permissionService.setPermission(nodeRef, OpenDeskModel.GLOBAL_PROJECTMANAGERS, OpenDeskModel.COLLABORATOR, true);

        // Add Owner and Manager to their groups
        authorityService.addAuthority(projectowner, owner);
        authorityService.addAuthority(projectmanager, site_manager);

        //Remove Project creator from SiteManager-group
        authorityService.removeAuthority(authorities.get(OpenDeskModel.MANAGER), creator);
    }
}