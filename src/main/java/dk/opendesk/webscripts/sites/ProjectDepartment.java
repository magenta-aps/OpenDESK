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
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
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

    private NodeRef newSiteRef = null;
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
            String site_short_name = Utils.getJSONObject(json, "PARAM_SHORT_NAME");
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
                    result = createPDSite(site_short_name, site_name, site_description,
                            site_sbsys, site_center_id, site_owner, site_manager, site_visibility, template);
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


    private void executeTemplate(NodeRef newSite, String template_name) {

        System.out.println(template_name);

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, "@od\\:template_name:\"" + template_name + "\"");

        if (siteSearchResult.length() > 0) {

            System.out.println("yoyoyo");
            NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
            SiteInfo templateSite = siteService.getSite(siteNodeRef);
            SiteInfo newSiteInfo = siteService.getSite(newSiteRef);

            // Get the documentLibrary of the template site.
            NodeRef template_documentlibrary = siteService.getContainer(templateSite.getShortName(), "documentlibrary");

            // Get the documentLibrary of the new site.
            NodeRef newSite_documentlibrary = siteService.getContainer(newSiteInfo.getShortName(), "documentlibrary");

             nodeService.deleteNode(newSite_documentlibrary);

            try {
                fileFolderService.copy(template_documentlibrary, newSite, "documentLibrary");
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }

    }

    private JSONArray createPDSite(String site_short_name, String site_name, String site_description, String site_sbsys,
                                   String site_center_id, String site_owner, String site_manager, SiteVisibility site_visibility, String template) {

        if(site_visibility == null)
            site_visibility = SiteVisibility.PUBLIC;

        JSONArray result = new JSONArray();
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            String site_short_name_with_version = site_short_name;

            int i = 1;
            do {
                try {
                    newSiteRef = createSite(site_short_name_with_version, site_name, site_description, site_sbsys, site_center_id, site_visibility);
                }
                catch(SiteServiceException e) {
                    if(e.getMsgId().equals("site_service.unable_to_create"))
                        site_short_name_with_version = site_short_name + "-" + ++i;
                }
            }
            while(newSiteRef == null);

            Long id = (Long) nodeService.getProperty(newSiteRef, ContentModel.PROP_NODE_DBID);

            createGroupAddMembers(Long.toString(id), site_owner, site_manager);

            if (template != "") {
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

            if(site_visibility != null)
                nodeService.setProperty(site.getNodeRef(), SiteModel.PROP_SITE_VISIBILITY, site_visibility);

            updateSite(site, site_name, site_description, site_sbsys, site_center_id, site_state);

            String dbid = nodeService.getProperty(site.getNodeRef(), ContentModel.PROP_NODE_DBID).toString();
            String parentGroup = "GROUP_"  + dbid;

            if(!site_owner.isEmpty()) {
                String ownerGroup = parentGroup + "_" + OpenDeskModel.PD_GROUP_PROJECTOWNER;
                updateSingleGroupMember(ownerGroup, site_owner);
            }

            if(!site_manager.isEmpty()) {
                String managerGroup = parentGroup + "_" + OpenDeskModel.PD_GROUP_PROJECTMANAGER;
                updateSingleGroupMember(managerGroup, site_manager);
            }

        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONSuccess();
    }

    private NodeRef createSite(String shortName, String name, String description, String sbsys, String center_id, SiteVisibility siteVisibility) {

        SiteInfo site = siteService.createSite("site-dashboard", shortName, name, description, siteVisibility);

        updateSite(site, name, description, sbsys, center_id, OpenDeskModel.STATE_ACTIVE);

        // create documentLibary
        String defaultFolder = "documentLibrary";
        Map<QName, Serializable> documentLibaryProps = new HashMap<>();
        documentLibaryProps.put(ContentModel.PROP_NAME, defaultFolder);

        ChildAssociationRef child = nodeService.createNode(site.getNodeRef(), ContentModel.ASSOC_CONTAINS, QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, "documentLibrary"), ContentModel.TYPE_FOLDER, documentLibaryProps);

        return site.getNodeRef();
    }

    private void updateSite(SiteInfo site, String name, String description, String sbsys, String center_id, String state) {

        // add the projectdepartment aspect
        Map<QName, Serializable> aspectProps = new HashMap<>();
        if (!name.isEmpty())
            aspectProps.put(OpenDeskModel.PROP_PD_NAME, name);
        if (!description.isEmpty())
            aspectProps.put(OpenDeskModel.PROP_PD_DESCRIPTION, description);
        if (!sbsys.isEmpty())
            aspectProps.put(OpenDeskModel.PROP_PD_SBSYS, sbsys);
        if(!state.isEmpty())
            aspectProps.put(OpenDeskModel.PROP_PD_STATE, state);
        if (!center_id.isEmpty())
            aspectProps.put(OpenDeskModel.PROP_PD_CENTERID, center_id);

        nodeService.addAspect(site.getNodeRef(), OpenDeskModel.ASPECT_PD, aspectProps);
    }

    private void updateSingleGroupMember(String group, String userName) {

        //Clear group
        Set<String> members = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);
        for (String member : members)
            authorityService.removeAuthority(group, member);

        //Add member
        authorityService.addAuthority(group, userName);
    }

    private void createGroupAddMembers(String id, String owner, String site_manager) {

        // create groups and add permissions
        String parentGroup = authorityService.createAuthority(AuthorityType.GROUP,  id);

        String projectowner = authorityService.createAuthority(AuthorityType.GROUP, id + "_" + OpenDeskModel.PD_GROUP_PROJECTOWNER);
        authorityService.addAuthority(parentGroup, projectowner);
        authorityService.addAuthority(projectowner, owner);

        String projectmanager = authorityService.createAuthority(AuthorityType.GROUP, id + "_" + OpenDeskModel.PD_GROUP_PROJECTMANAGER);
        authorityService.addAuthority(parentGroup, projectmanager);
        authorityService.addAuthority(projectmanager,site_manager);

        String monitors = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_MONITORS);
        authorityService.addAuthority(parentGroup, monitors);

        String projectgroup = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_PROJECTGROUP);
        authorityService.addAuthority(parentGroup, projectgroup);

        String workgroup = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_WORKGROUP);
        authorityService.addAuthority(parentGroup, workgroup);

        String steeringgroup = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_STEERING_GROUP);
        System.out.println(steeringgroup);
        System.out.println(steeringgroup);
        System.out.println(steeringgroup);
        System.out.println(steeringgroup);
        authorityService.addAuthority(parentGroup, steeringgroup);

        permissionService.setPermission(newSiteRef, monitors, "Collaborator", true);
        permissionService.setPermission(newSiteRef, projectowner, "Collaborator", true);
        permissionService.setPermission(newSiteRef, projectgroup, "Collaborator", true);
        permissionService.setPermission(newSiteRef, projectmanager, "Collaborator", true);
        permissionService.setPermission(newSiteRef, steeringgroup, "Collaborator", true);
        permissionService.setPermission(newSiteRef,workgroup,"Collaborator",true);

        // allow all other projectmanagers to access this project

        permissionService.setPermission(newSiteRef, OpenDeskModel.GLOBAL_PROJECTMANAGERS, "Collaborator", true);
    }
}