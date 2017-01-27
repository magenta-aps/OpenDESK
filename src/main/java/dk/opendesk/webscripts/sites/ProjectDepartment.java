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
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;

import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.*;

import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;

import java.util.*;

public class ProjectDepartment extends AbstractWebScript {

    private NodeRef newSiteRef = null;
    private PermissionService permissionService;


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

        System.out.println("creating a projectdepartment project....");

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        Content c = webScriptRequest.getContent();

        JSONObject json;

        try {
            json = new JSONObject(c.getContent());

            if (!json.has("PARAM_NAME") || json.getString("PARAM_NAME").length() == 0)
            {
                throw new WebScriptException(Status.STATUS_BAD_REQUEST,
                        "PARAM_NAME 'NAME' is a required POST parameter.");
            }
            String site_name = json.getString("PARAM_NAME");

            if (!json.has("PARAM_DESCRIPTION") || json.getString("PARAM_DESCRIPTION").length() == 0)
            {
                throw new WebScriptException(Status.STATUS_BAD_REQUEST,
                        "PARAM_DESCRIPTION 'DESCRIPTION' is a required POST parameter.");
            }
            String site_description = json.getString("PARAM_DESCRIPTION");

            if (!json.has("PARAM_SBSYS") || json.getString("PARAM_SBSYS").length() == 0)
            {
                throw new WebScriptException(Status.STATUS_BAD_REQUEST,
                        "PARAM_SBSYS 'SBSYS' is a required POST parameter.");
            }
            String site_sbsys = json.getString("PARAM_SBSYS");

            if (!json.has("PARAM_OWNER") || json.getString("PARAM_OWNER").length() == 0)
            {
                throw new WebScriptException(Status.STATUS_BAD_REQUEST,
                        "PARAM_OWNER 'OWNER' is a required POST parameter.");
            }
            String site_owner = json.getString("PARAM_OWNER");

            if (!json.has("PARAM_MANAGER") || json.getString("PARAM_MANAGER").length() == 0)
            {
                throw new WebScriptException(Status.STATUS_BAD_REQUEST,
                        "PARAM_MANAGER 'MANAGER' is a required POST parameter.");
            }
            String site_manager = json.getString("PARAM_MANAGER");




            this.createSite(site_name, site_description, site_sbsys, SiteVisibility.PUBLIC);

            Long id = (Long)nodeService.getProperty(newSiteRef, ContentModel.PROP_NODE_DBID);

            this.createGroupAddMembers(Long.toString(id), site_owner, site_manager);





            JSONObject return_json = new JSONObject();

            return_json.put("status", "success");
            return_json.put("nodeRef", newSiteRef);

            JSONArray result = new JSONArray();
            result.add(return_json);

            webScriptResponse.setContentEncoding("UTF-8");
            result.writeJSONString(webScriptResponse.getWriter());


        }
        catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
            JSONObject return_json = new JSONObject();
            try {
                return_json.put("status", "failure");
                return_json.put("error", e.toString());

                JSONArray result = new JSONArray();
                result.add(return_json);

                webScriptResponse.setContentEncoding("UTF-8");
                result.writeJSONString(webScriptResponse.getWriter());
            }
            catch (Exception ex) {
                ex.printStackTrace();
            }


        }
    }

    private void createSite(String name, String description, String sbsys, SiteVisibility siteVisibility) {


        SiteInfo site = siteService.createSite("site-dashboard", name, name, description, siteVisibility);

        this.newSiteRef = site.getNodeRef();


        // add the projectdepartment aspect

        Map<QName, Serializable> aspectProps = new HashMap<QName, Serializable>();
        aspectProps.put(OpenDeskModel.PROP_PD_NAME, name);
        aspectProps.put(OpenDeskModel.PROP_PD_DESCRIPTION, description);
        aspectProps.put(OpenDeskModel.PROP_PD_SBSYS, sbsys);
        aspectProps.put(OpenDeskModel.PROP_PD_STATE, OpenDeskModel.STATE_ACTIVE);

        nodeService.addAspect(site.getNodeRef(), OpenDeskModel.ASPECT_PD, aspectProps);

        // create documentLibary
        String defaultFolder = "documentLibrary";
        Map<QName, Serializable> documentLibaryProps = new HashMap<QName, Serializable>();
        documentLibaryProps.put(ContentModel.PROP_NAME, defaultFolder);


        ChildAssociationRef child = nodeService.createNode(site.getNodeRef(), ContentModel.ASSOC_CONTAINS, QName.createQName(OpenDeskModel.OD_PREFIX, "documentLibrary"), ContentModel.TYPE_FOLDER, documentLibaryProps);
    }


    private void createGroupAddMembers(String id, String owner, String site_manager) {

        System.out.println("id=" + id);


        // create groups and add permissions
        System.out.println("heuy");

        String parentGroup = authorityService.createAuthority(AuthorityType.GROUP,  id);
        System.out.println("heu123y");
        String monitors = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_MONITORS);
        authorityService.addAuthority(parentGroup, monitors);

        String projectowner = authorityService.createAuthority(AuthorityType.GROUP, id + "_" + OpenDeskModel.PD_GROUP_PROJECTOWNER);
        authorityService.addAuthority(parentGroup, projectowner);
        authorityService.addAuthority(projectowner,owner);

        String projectgroup = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_PROJECTGROUP);
        authorityService.addAuthority(parentGroup, projectgroup);



        String projectmanager = authorityService.createAuthority(AuthorityType.GROUP, id + "_" + OpenDeskModel.PD_GROUP_PROJECTMANAGER);
        authorityService.addAuthority(parentGroup, projectmanager);
        authorityService.addAuthority(projectmanager,site_manager);




        String workgroup = authorityService.createAuthority(AuthorityType.GROUP,  id + "_" + OpenDeskModel.PD_GROUP_WORKGROUP);
        authorityService.addAuthority(parentGroup, workgroup);

        permissionService.setPermission(newSiteRef, monitors, PermissionService.CONTRIBUTOR, true);
        permissionService.setPermission(newSiteRef, projectowner, PermissionService.CONTRIBUTOR, true);
        permissionService.setPermission(newSiteRef, projectgroup, PermissionService.CONTRIBUTOR, true);
        permissionService.setPermission(newSiteRef, projectmanager, PermissionService.CONTRIBUTOR, true);
        permissionService.setPermission(newSiteRef,workgroup,PermissionService.CONTRIBUTOR,true);

        // allow all other projectmanagers to access this project

        permissionService.setPermission(newSiteRef, OpenDeskModel.GLOBAL_PROJECTMANAGERS, PermissionService.CONTRIBUTOR, true);

    }


}