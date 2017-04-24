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
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.ContentTransformer;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.invitation.Invitation;
import org.alfresco.service.cmr.invitation.InvitationService;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.rendition.RenditionService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.QNamePattern;
import org.alfresco.util.ISO9075;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.*;

public class Sites extends AbstractWebScript {


    final Logger logger = LoggerFactory.getLogger(Sites.class);

    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    AuthenticationService authenticationService;

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }

    FileFolderService fileFolderService;

    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }

    ContentService contentService;

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }

    SearchService searchService;

    public void setInvitationService(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    InvitationService invitationService;

    private NodeArchiveService nodeArchiveService;
    private SiteService siteService;
    private NodeService nodeService;
    private PersonService personService;

    public void setRenditionService(RenditionService renditionService) {
        this.renditionService = renditionService;
    }

    private RenditionService renditionService;

    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private PermissionService permissionService;

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    private AuthorityService authorityService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    public void setNodeArchiveService(NodeArchiveService nodeArchiveService) {
        this.nodeArchiveService = nodeArchiveService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            // Read all used parameters no matter what method is used.
            // Those parameters that are not sent are set to an empty string
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String query = Utils.getJSONObject(json, "PARAM_QUERY");
            String siteShortName = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");
            String siteDisplayName = Utils.getJSONObject(json, "PARAM_SITE_DISPLAY_NAME");
            String user = Utils.getJSONObject(json, "PARAM_USER");
            String group = Utils.getJSONObject(json, "PARAM_GROUP");
            String role = Utils.getJSONObject(json, "PARAM_ROLE");
            String source = Utils.getJSONObject(json, "PARAM_SOURCE");
            String destination = Utils.getJSONObject(json, "PARAM_DESTINATION");
            String description = Utils.getJSONObject(json, "PARAM_DESCRIPTION");
            String fileName = Utils.getJSONObject(json, "PARAM_FILENAME");
            String firstName = Utils.getJSONObject(json, "PARAM_FIRSTNAME");
            String lastName = Utils.getJSONObject(json, "PARAM_LASTNAME");
            String email = Utils.getJSONObject(json, "PARAM_EMAIL");
            String site_visibility_str = Utils.getJSONObject(json, "PARAM_VISIBILITY");
            SiteVisibility site_visibility = Utils.getVisibility(site_visibility_str);

            if (method != null) {
                switch (method) {
                    case "getSite":
                        result = this.getSiteInfo(siteShortName);
                        break;

                    case "getAll":
                        result = this.getAllSites(query);
                        break;

                    case "createSite":
                        result = this.createSite(siteDisplayName, description, site_visibility);
                        break;

                    case "deleteTestSites":
                        result = this.removeTestSites();
                        break;

                    case "getSitesPerUser":
                        result = this.getAllSitesForCurrentUser();
                        break;

                    case "addUser":
                        result = this.addUser(siteShortName, user, group);
                        break;

                    case "removeUser":
                        result = this.removeUser(siteShortName, user, group);
                        break;

                    case "addPermission":
                        result = this.addPermission(siteShortName, user, role);
                        break;

                    case "removePermission":
                        result = this.removePermission(siteShortName, user, role);
                        break;

                    case "getCurrentUserSiteRole":
                        result = this.getCurrentUserSiteRole(siteShortName);
                        break;

                    case "addLink":
                        result = this.addLink(source, destination);
                        break;

                    case "deleteLink":
                        NodeRef source_n = new NodeRef("workspace://SpacesStore/" + source);
                        NodeRef destination_n = new NodeRef("workspace://SpacesStore/" + destination);

                        result = this.deleteLink(source_n, destination_n);
                        break;

                    case "getSiteType":
                        result = this.getSiteType(siteShortName);
                        break;

                    case "getTemplates":
                        result = this.getTemplates();
                        break;

                    case "createTemplate":
                        result = this.createTemplate(siteShortName, description);
                        break;

                    case "makeSiteATemplate":
                        result = this.makeSiteATemplate(siteShortName);
                        break;

                    case "createMembersPDF":
                        result = this.createMembersPDF(siteShortName);
                        break;

                    case "deleteSite":
                        result = this.deleteSite(siteShortName);
                        break;
                    case "inviteExternalUser":
                        result = this.inviteExternalUser(firstName, lastName, siteShortName, email);
                        break;

                    case "getDocumentTemplateSite":
                        result = this.getDocumentTemplateSite();
                        break;

                    case "returnFileName":
                        result = this.returnFileName(destination, fileName);
                        break;
                }
            }
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
            result = Utils.getJSONError(e);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    private JSONArray getAllSites(String q) {
        JSONArray result = new JSONArray();

        //TODO : carefully choose the number of sites to return
        List<SiteInfo> allSites = siteService.listSites(q, q);

        for (SiteInfo siteInfo : allSites) {
            String siteShortName = siteInfo.getShortName();
            JSONArray JSONresult = getCurrentUserSiteRole(siteShortName);
            JSONObject jsonObject = (JSONObject) JSONresult.get(0);
            try {
                String role = Utils.getJSONObject(jsonObject, "role");
                if (SiteVisibility.PUBLIC.equals(siteInfo.getVisibility()) || !OpenDeskModel.OUTSIDER.equals(role)) {
                    JSONObject json = convertSiteInfoToJSON(siteInfo);
                    if (CheckIfSiteIsTemplate(siteInfo))
                        continue;
                    result.add(json);
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    private JSONArray getAllSitesForCurrentUser() {

        JSONArray result = new JSONArray();

        List<SiteInfo> currentuser_standard_sites = siteService.listSites(authenticationService.getCurrentUserName());

        for (SiteInfo siteInfo : currentuser_standard_sites) {
            if (CheckIfSiteIsTemplate(siteInfo))
                continue;
            JSONObject json = convertSiteInfoToJSON(siteInfo);
            result.add(json);
        }

        return result;
    }

    private boolean CheckIfSiteIsTemplate(SiteInfo siteInfo) {
        NodeRef n = siteInfo.getNodeRef();
        return nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES);
    }

    public JSONArray removeTestSites() {

        ArrayList l = new ArrayList();
        l.add(OpenDeskModel.testsite_1);
        l.add(OpenDeskModel.testsite_2);
        l.add(OpenDeskModel.testsite_rename);
        l.add(OpenDeskModel.testsite_new_name);

        Iterator i = l.iterator();

        while (i.hasNext()) {
            String siteName = (String) i.next();

            SiteInfo site = siteService.getSite(siteName);

            if (site != null) {
                siteService.deleteSite(siteName);
            }
        }
        return Utils.getJSONSuccess();
    }

    private JSONArray addUser(String siteShortName, String user, String group) {

        String groupName = Utils.getAuthorityName(siteShortName, group);

        authorityService.addAuthority(groupName, user);

        return Utils.getJSONSuccess();
    }

    private JSONArray removeUser(String siteShortName, String user, String group) {

        String groupName = Utils.getAuthorityName(siteShortName, group);

        authorityService.removeAuthority(groupName, user);

        return Utils.getJSONSuccess();
    }

    private JSONArray addPermission(String siteShortName, String user, String role) {

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();

        permissionService.setPermission(ref, user, role, true);

        return Utils.getJSONSuccess();
    }

    private JSONArray removePermission(String siteShortName, String user, String role) {

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();

        permissionService.deletePermission(ref, user, role);

        return Utils.getJSONSuccess();
    }

    private JSONArray getCurrentUserSiteRole(String siteShortName) {

        Map<String, Boolean> authorities = new HashMap<>();
        authorities.put(OpenDeskModel.MANAGER, false);
        authorities.put(OpenDeskModel.COLLABORATOR, false);
        authorities.put(OpenDeskModel.CONTRIBUTOR, false);
        authorities.put(OpenDeskModel.CONSUMER, false);

        for (Map.Entry<String, Boolean> authority : authorities.entrySet()) {
            String group = Utils.getAuthorityName(siteShortName, "Site" + authority.getKey());
            Set<String> tempAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, false);
            String userName = authenticationService.getCurrentUserName();
            if (tempAuthorities.contains(userName))
                authority.setValue(true);
        }

        String role;
        if (authorities.get(OpenDeskModel.MANAGER)) {
            role = OpenDeskModel.MANAGER;

            NodeRef n = siteService.getSite(siteShortName).getNodeRef();

            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {

                String currentUser = authenticationService.getCurrentUserName();

                String projectOwnerGroup = Utils.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                Set<String> tempAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectOwnerGroup, true);
                if (tempAuthorities.contains(currentUser))
                    role = OpenDeskModel.OWNER;
            }
        } else if (authorities.get(OpenDeskModel.COLLABORATOR) || authorities.get(OpenDeskModel.CONTRIBUTOR)) {
            role = OpenDeskModel.COLLABORATOR;
        } else if (authorities.get(OpenDeskModel.CONSUMER)) {
            role = OpenDeskModel.CONSUMER;
        } else
            role = OpenDeskModel.OUTSIDER;

        return Utils.getJSONReturnPair("role", role);
    }

    private JSONArray addLink(String source_project, String destinaion_project) {

        SiteInfo source = siteService.getSite(source_project);
        SiteInfo destination = siteService.getSite(destinaion_project);

        // Get the documentLibrary of the site.
        NodeRef source_documentLib = siteService.getContainer(source.getShortName(), "documentlibrary");

        NodeRef dest_documentLib = siteService.getContainer(destination.getShortName(), "documentlibrary");

        // create link for source
        Map<QName, Serializable> linkProperties = new HashMap<QName, Serializable>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(destination.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, destination.getShortName());


        ChildAssociationRef source_nodeRef = nodeService.createNode(source_documentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);

        // create link for destination
        linkProperties = new HashMap<QName, Serializable>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(source.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, source.getShortName());


        ChildAssociationRef destination_nodeRef = nodeService.createNode(dest_documentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);

        // for easy deletion of the links, we do a save of the nodeRefs on each side
        nodeService.setProperty(source_nodeRef.getChildRef(), OpenDeskModel.PROP_LINK_TARGET_NODEREF, destination_nodeRef.getChildRef());
        nodeService.setProperty(destination_nodeRef.getChildRef(), OpenDeskModel.PROP_LINK_TARGET_NODEREF, source_nodeRef.getChildRef());

        return Utils.getJSONSuccess();
    }

    private JSONArray deleteLink(NodeRef source, NodeRef destination) {
        nodeService.deleteNode(source);
        nodeService.deleteNode(destination);

        return Utils.getJSONSuccess();
    }


    private JSONArray createMembersPDF(String shortName) {


        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...


            SiteInfo site = siteService.getSite(shortName);
            String output = "Medlemsliste for projektet: " + site.getTitle() + "\n\n\n\n\n";


            // until further noctice, we dont want to make pds for normal projects

//            String siteManagerGroup = "GROUP_site_" + shortName + "_SiteManager";
//            String siteManagerMembers = "SITEManager: \n\n";
//            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, siteManagerGroup, true);
//
//            System.out.println(authorities);
//            for (String authority : authorities) {
//                NodeRef person = personService.getPerson(authority);
//                siteManagerMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
//            }
//
//            String SiteCollaboratorGroup = "GROUP_site_" + shortName + "_SiteCollaborator";
//            String SiteCollaboratorMembers = "SITECollaborator: \n\n";
//            authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteCollaboratorGroup, true);
//            for (String authority : authorities) {
//                NodeRef person = personService.getPerson(authority);
//                SiteCollaboratorMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
//            }
//
//            String SiteContributorGroup = "GROUP_site_" + shortName + "_SiteContributor";
//            String SiteContributorMembers = "SITEContributor: \n\n";
//            authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteContributorGroup, true);
//            for (String authority : authorities) {
//                NodeRef person = personService.getPerson(authority);
//                SiteContributorMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
//            }
//
//            String SiteConsumerGroup = "GROUP_site_" + shortName + "_SiteConsumer";
//            String SiteConsumerMembers = "SITEConsumer: \n\n";
//            authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteConsumerGroup, true);
//            for (String authority : authorities) {
//                NodeRef person = personService.getPerson(authority);
//                SiteConsumerMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
//            }
//
//
//
//
//            output += siteManagerMembers + "\n\n";
//
//            output += SiteCollaboratorMembers + "\n\n";
//
//            output += SiteContributorMembers + "\n\n";
//
//            output += SiteConsumerMembers + "\n\n";


            // extra groups for the new projecttype

            NodeRef n = siteService.getSite(shortName).getNodeRef();
            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {

                String projectManagerGroup = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
                String projectManagerGroupMembers = "PROJEKTLEDER: \n\n";
                Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectManagerGroup, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    projectManagerGroupMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }

                String projectOwnerGroup = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                String projectOwnerMembers = "PROJEKTEJER: \n\n";
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectOwnerGroup, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    projectOwnerMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }

                String projectGroup = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_PROJECTGROUP);
                String projectGroupMembers = "PROJEKTGRUPPE: \n\n";
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectGroup, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    projectGroupMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }

                String workGroup = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_WORKGROUP);
                String workGroupMembers = "ARBEJDSGRUPPE: \n\n";
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, workGroup, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    workGroupMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }


                String projectMonitors = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_MONITORS);
                String projectMonitorsMembers = "FØLGEGRUPPE: \n\n";
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectMonitors, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    projectMonitorsMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }

                String steeringGroup = Utils.getAuthorityName(shortName, OpenDeskModel.PD_GROUP_STEERING_GROUP);
                String steeringGroupMembers = "STYREGRUPPE: \n\n";
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, steeringGroup, true);
                for (String authority : authorities) {
                    NodeRef person = personService.getPerson(authority);
                    steeringGroupMembers += (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
                }

                output += projectOwnerMembers + "\n\n";
                output += projectManagerGroupMembers + "\n\n";
                output += projectGroupMembers + "\n\n";
                output += workGroupMembers + "\n\n";
                output += projectMonitorsMembers + "\n\n";
                output += steeringGroupMembers + "\n\n";

            }



            // delete the pdf if it is already present
            NodeRef documentLib = siteService.getContainer(site.getShortName(), "documentlibrary");
            NodeRef pdfnode = nodeService.getChildByName(documentLib, ContentModel.ASSOC_CONTAINS, ISO9075.encode("Medlemsoversigt.pdf"));

            if (pdfnode != null) {
                nodeService.deleteNode(pdfnode);
            }


            Map<QName, Serializable> documentLibaryProps = new HashMap<QName, Serializable>();
            documentLibaryProps.put(ContentModel.PROP_NAME, "Medlemsoversigt.pdf");

            ChildAssociationRef child = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(ContentModel.USER_MODEL_URI, "tempfile1"), ContentModel.TYPE_CONTENT);
            ChildAssociationRef pdf = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(ContentModel.USER_MODEL_URI, "thePDF"), ContentModel.TYPE_CONTENT, documentLibaryProps);

            // hide the pdf from the users
            Map<QName, Serializable> aspectProps = new HashMap<QName, Serializable>();
            nodeService.addAspect(pdf.getChildRef(), ContentModel.ASPECT_HIDDEN, aspectProps);


            ContentWriter writer = this.contentService.getWriter(child.getChildRef(), ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
            writer.setEncoding("UTF-8");
            writer.putContent(output);

            writer = this.contentService.getWriter(pdf.getChildRef(), ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
            writer.putContent(output);

            ContentReader pptReader = contentService.getReader(child.getChildRef(), ContentModel.PROP_CONTENT);
            ContentWriter pdfWriter = contentService.getWriter(pdf.getChildRef(), ContentModel.PROP_CONTENT, true);
            ContentTransformer pptToPdfTransformer = contentService.getTransformer(MimetypeMap.MIMETYPE_TEXT_PLAIN, MimetypeMap.MIMETYPE_PDF);


            pptToPdfTransformer.transform(pptReader, pdfWriter);

            nodeService.deleteNode(child.getChildRef());

            return Utils.getJSONReturnPair("Noderef", pdf.getChildRef().getId());
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    private JSONArray getSiteType(String shortName) {

        NodeRef n = siteService.getSite(shortName).getNodeRef();

            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {
            return Utils.getJSONReturnPair("type", OpenDeskModel.pd_project);
        } else {
            return Utils.getJSONReturnPair("type", OpenDeskModel.project);
        }
    }


    private JSONObject convertSiteInfoToJSON(SiteInfo s) {
        try {
            JSONObject json = new JSONObject();
            String siteShortName = s.getShortName();

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            json.put("created", sdf.format(s.getCreatedDate()));
            json.put("shortName", siteShortName);
            json.put("visibility", s.getVisibility());

            JSONArray JSONresult = getCurrentUserSiteRole(siteShortName);
            JSONObject jsonObject = (JSONObject) JSONresult.get(0);
            try {
                String role = Utils.getJSONObject(jsonObject, "role");
                json.put("current_user_role", role);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            NodeRef n = s.getNodeRef();
            json.put("nodeRef", n.toString());

            String manager = "";
            String owner = "";

            boolean notTemplateSite = true;

            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES) || nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_DOCUMENT)) {
                notTemplateSite = false;
            }



            if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {
                json.put("title", (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_NAME));
                json.put("description", (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_DESCRIPTION));
                json.put("type", OpenDeskModel.pd_project);
                json.put("state", (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_STATE));
                String centerID = (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_CENTERID);
                json.put("center_id", centerID);
                String centerName = authorityService.getAuthorityDisplayName("GROUP_" + centerID);
                json.put("center_name", centerName);
                json.put("sbsys", (String) nodeService.getProperty(n, OpenDeskModel.PROP_PD_SBSYS));
                json.put("notTemplateSite", true); // only grupperum can be used as templateSites

                String projectManagerGroup = Utils.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
                Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectManagerGroup, true);
                manager = authorities.iterator().next();

                String projectOwnerGroup = Utils.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
                authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectOwnerGroup, true);
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

                String SiteManager = Utils.getAuthorityName(siteShortName, "SiteManager");
                Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteManager, true);
                manager = authorities.iterator().next();
            }

            //Get Manager
            if (!manager.isEmpty()) {
                JSONObject managerObj = getUserInfo(manager);
                json.put("manager", managerObj);
            }

            //Get Owner
            if (!owner.isEmpty()) {
                JSONObject ownerObj = getUserInfo(owner);
                json.put("owner", ownerObj);
            }

            //Get Creator
            String creator = nodeService.getProperty(n, ContentModel.PROP_CREATOR).toString();
            JSONObject creatorObj = getUserInfo(creator);
            json.put("creator", creatorObj);

            //Get Member list
            JSONArray membersArray = new JSONArray();
            String group = Utils.getAuthorityName(siteShortName, "");
            Set<String> members = authorityService.getContainedAuthorities(AuthorityType.USER, group, false);

            for (String username : members) {
                membersArray.add(username);
            }
            json.put("members", membersArray);

            return json;

        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    private JSONObject getUserInfo(String userName) throws JSONException {

        NodeRef cn = this.personService.getPerson(userName);

        JSONObject user = new JSONObject();
        user.put("userName", (String) nodeService.getProperty(cn, ContentModel.PROP_USERNAME));
        user.put("firstName", (String) nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME));
        user.put("lastName", (String) nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
        user.put("fullName", (String) nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));

        return user;
    }

    private JSONArray getSiteInfo(String shortName) {

        SiteInfo siteInfo = siteService.getSite(shortName);
        JSONArray json = new JSONArray();
        json.add(convertSiteInfoToJSON(siteInfo));
        return json;
    }

    private JSONArray getTemplates() {

        JSONArray result = new JSONArray();

        String query = "ASPECT:\"od:projecttype_templates\" ";

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);


        for (int i = 0; i <= siteSearchResult.length() - 1; i++) {
            NodeRef siteNodeRef = siteSearchResult.getNodeRef(i);
            SiteInfo siteInfo = siteService.getSite(siteNodeRef);

            JSONObject json = convertSiteInfoToJSON(siteInfo);
            result.add(json);
        }

        return result;
    }

    private JSONArray createSite(String displayName, String description, SiteVisibility site_visibility) {

        NodeRef nodeRef = Utils.createSite(nodeService, contentService, siteService, displayName,
                description, site_visibility);

        return getSiteInfo(siteService.getSiteShortName(nodeRef));
    }

    private JSONArray createTemplate(String displayName, String description) {

        NodeRef nodeRef = Utils.createSite(nodeService, contentService, siteService, displayName,
                description, SiteVisibility.PUBLIC);
        makeSiteATemplate(nodeRef);
        return getSiteInfo(siteService.getSiteShortName(nodeRef));
    }

    private JSONArray makeSiteATemplate(String shortName) {

        SiteInfo s = siteService.getSite(shortName);
        return makeSiteATemplate(s.getNodeRef());
    }

    private JSONArray makeSiteATemplate(NodeRef nodeRef) {

        Map<QName, Serializable> aspectProps = new HashMap<>();
        nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES, aspectProps);

        return Utils.getJSONSuccess();
    }

    public JSONArray deleteSite(String siteShortName) {

        SiteInfo site = siteService.getSite(siteShortName);

        if (site != null) {
            // Find all links pointing from this site
            NodeRef documentLibrary = siteService.getContainer(siteShortName, SiteService.DOCUMENT_LIBRARY);

            Set<QName> childNodeTypeQNames = new HashSet<>(Collections.singletonList(OpenDeskModel.PROP_LINK));
            List<ChildAssociationRef> childAssocs = nodeService.getChildAssocs(documentLibrary, childNodeTypeQNames);

            // Delete the counterpart links linking to this site
            for (ChildAssociationRef assoc : childAssocs)
            {
                NodeRef n = assoc.getChildRef();
                if (n != null)
                {
                    String query = "TYPE:\"od:link\" AND @od\\:targetproject_noderef:\"" + n + "\"";
                    StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
                    ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);
                    NodeRef ln = siteSearchResult.getNodeRef(0);
                    nodeService.deleteNode(ln);
                }
            }

            // Delete the site ñ
            siteService.deleteSite(siteShortName);

            // Delete all groups/authorities of the site
            String authority = Utils.getAuthorityName(siteShortName, "");
            authorityService.deleteAuthority(authority, true);

            return Utils.getJSONSuccess();
        }
        return Utils.getJSONError(new Exception());
    }


    public JSONArray inviteExternalUser(String firstName, String lastName, String shortName, String email) {

        Invitation.ResourceType resourceType = Invitation.ResourceType.WEB_SITE;

        invitationService.inviteNominated(firstName,lastName,email,resourceType,"test", SiteModel.SITE_COLLABORATOR,"acceptUrl", "rejectUrl");

        return Utils.getJSONSuccess();
    }

    public JSONArray getDocumentTemplateSite() {

        String query = "ASPECT:\"" + OpenDeskModel.ASPECT_PD_DOCUMENT + "\" ";

        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);

        NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
        SiteInfo siteInfo = siteService.getSite(siteNodeRef);

        return Utils.getJSONReturnPair("shortName", siteInfo.getShortName());
    }

    private JSONArray returnFileName (String destination, String fileName) {


        NodeRef destination_n = new NodeRef(destination);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(destination_n);

        int count = 0;
        String name = fileName.split("\\.")[0];
        name = name.split("()")[0];
        String ext = fileName.split("\\.")[1];

        for (ChildAssociationRef child : childAssociationRefs) {

            String file = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_NAME);

            if (file.contains(name)) {
                count++;
                System.out.println("count" + count);
            }
        }

        if (count > 0) {
            System.out.println("what is count:" + count);

            fileName = name + "(" + count + ")." + ext;
        }

        return Utils.getJSONReturnPair("fileName", fileName);
    }



}