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
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ISO9075;
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
import java.text.SimpleDateFormat;
import java.util.*;

public class Sites extends AbstractWebScript {

    private AuthenticationService authenticationService;
    private ContentService contentService;
    private SearchService searchService;
    private SiteService siteService;
    private NodeService nodeService;
    private PersonService personService;
    private PermissionService permissionService;
    private AuthorityService authorityService;
    private PreferenceService preferenceService;

    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }
    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
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
            String siteVisibilityStr = Utils.getJSONObject(json, "PARAM_VISIBILITY");
            SiteVisibility siteVisibility = Utils.getVisibility(siteVisibilityStr);
            String siteType = Utils.getJSONObject(json, "PARAM_SITE_TYPE");

            if (method != null) {
                switch (method) {
                    case "getSite":
                        result = getSiteInfo(siteShortName);
                        break;

                    case "getAll":
                        result = getAllSites(query);
                        break;

                    case "createSite":
                        result = createSite(siteDisplayName, description, siteVisibility);
                        break;

                    case "getSitesPerUser":
                        result = getAllSitesForCurrentUser();
                        break;

                    case "addUser":
                        result = addUser(siteShortName, user, group);
                        break;

                    case "removeUser":
                        result = removeUser(siteShortName, user, group);
                        break;

                    case "addPermission":
                        result = addPermission(siteShortName, user, role);
                        break;

                    case "removePermission":
                        result = removePermission(siteShortName, user, role);
                        break;

                    case "getCurrentUserSiteRole":
                        result = getCurrentUserSiteRole(siteShortName);
                        break;

                    case "addLink":
                        result = addLink(source, destination);
                        break;

                    case "deleteLink":
                        NodeRef source_n = new NodeRef("workspace://SpacesStore/" + source);
                        NodeRef destination_n = new NodeRef("workspace://SpacesStore/" + destination);

                        result = deleteLink(source_n, destination_n);
                        break;

                    case "getSiteType":
                        result = getSiteType(siteShortName);
                        break;

                    case "getSiteGroups": // test not needed
                        result = getSiteGroups(siteType);
                        break;

                    case "getTemplates":
                        result = getTemplates();
                        break;

                    case "createTemplate":
                        result = createTemplate(siteShortName, description);
                        break;

                    case "makeSiteATemplate":
                        result = makeSiteATemplate(siteShortName);
                        break;

                    case "createMembersPDF": // test not needed
                        result = createMembersPDF(siteShortName);
                        break;

                    case "deleteSite":
                        result = this.deleteSite(siteShortName);
                        break;

                    case "returnFileName":
                        result = returnFileName(destination, fileName);
                        break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    /**
     * Gets all sites based on a search query.
     * (method = getAll)
     * @param q search query. Leave this blank to get all sites.
     * @return a JSONArray containing JSONObjects of all sites.
     */
    private JSONArray getAllSites(String q) throws JSONException {
        JSONArray result = new JSONArray();

        List<SiteInfo> allSites = siteService.listSites(q, q);

        for (SiteInfo siteInfo : allSites) {
            String siteShortName = siteInfo.getShortName();
            JSONArray JSONresult = getCurrentUserSiteRole(siteShortName);
            JSONObject jsonObject = (JSONObject) JSONresult.get(0);
            String role = Utils.getJSONObject(jsonObject, "role");
            if (SiteVisibility.PUBLIC.equals(siteInfo.getVisibility()) || !OpenDeskModel.OUTSIDER.equals(role)) {
                JSONObject json = convertSiteInfoToJSON(siteInfo);
                if (CheckIfSiteIsSpecial(siteInfo))
                    continue;
                result.add(json);
            }
        }

        return result;
    }

    /**
     * Gets all sites that the current user is explicitly part of.
     * (method = getSitesPerUser)
     * @return a JSONArray containing JSONObjects of all sites that the current user is explicitly part of.
     */
    private JSONArray getAllSitesForCurrentUser() throws JSONException {

        JSONArray result = new JSONArray();

        List<SiteInfo> currentUserSites = siteService.listSites(authenticationService.getCurrentUserName());

        for (SiteInfo siteInfo : currentUserSites) {
            if (CheckIfSiteIsSpecial(siteInfo))
                continue;
            JSONObject json = convertSiteInfoToJSON(siteInfo);
            result.add(json);
        }

        return result;
    }

    /**
     * Checks if a site is special.
     * A site is special if it has aspects; 'projecttype_templates' or 'document_template'.
     * @param siteInfo of the site.
     * @return true if the site is special. False if the site is not special.
     */
    private boolean CheckIfSiteIsSpecial(SiteInfo siteInfo) {
        NodeRef n = siteInfo.getNodeRef();
        return nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES) ||
        nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD_DOCUMENT);
    }

    /**
     * Adds a user to an authority group.
     * (method = addUser)
     * @param siteShortName short name of a site.
     * @param user username.
     * @param group group name.
     * @return JSONSuccess.
     */
    private JSONArray addUser(String siteShortName, String user, String group) {

        String groupName = Utils.getAuthorityName(siteShortName, group);
        authorityService.addAuthority(groupName, user);
        return Utils.getJSONSuccess();
    }

    /**
     * Removes a user from an authority group.
     * (method = removeUser)
     * @param siteShortName short name of a site.
     * @param user username.
     * @param group group name.
     * @return JSONSuccess.
     */
    private JSONArray removeUser(String siteShortName, String user, String group) {

        String groupName = Utils.getAuthorityName(siteShortName, group);
        authorityService.removeAuthority(groupName, user);
        return Utils.getJSONSuccess();
    }

    /**
     * Adds a permission for a site to a user.
     * (method = addPermission)
     * @param siteShortName short name of a site.
     * @param user username.
     * @param permission permission name.
     * @return JSONSuccess.
     */
    private JSONArray addPermission(String siteShortName, String user, String permission) {

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();
        permissionService.setPermission(ref, user, permission, true);
        return Utils.getJSONSuccess();
    }

    /**
     * Removes a permission for a site from a user.
     * (method = removePermission)
     * @param siteShortName short name of a site.
     * @param user username.
     * @param permission permission name.
     * @return JSONSuccess.
     */
    private JSONArray removePermission(String siteShortName, String user, String permission) {

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();
        permissionService.deletePermission(ref, user, permission);
        return Utils.getJSONSuccess();
    }

    /**
     * Gets the role of the current user in a site.
     * (method = getCurrentUserSiteRole)
     * @param siteShortName short name of a site.
     * @return a JSONArray containing role.
     */
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

    /**
     * Adds a link from one project to another.
     * (method = addLink)
     * @param sourceProject short name of the source project.
     * @param destinationProject short name of the destination project.
     * @return a JSONArray containing sourceLinkRef and destinationLinkRef that links to each other.
     */
    private JSONArray addLink(String sourceProject, String destinationProject) {

        SiteInfo source = siteService.getSite(sourceProject);
        SiteInfo destination = siteService.getSite(destinationProject);

        // Get the documentLibrary of the sites.
        NodeRef sourceDocumentLib = siteService.getContainer(source.getShortName(), OpenDeskModel.DOC_LIBRARY);
        NodeRef destDocumentLib = siteService.getContainer(destination.getShortName(), OpenDeskModel.DOC_LIBRARY);

        // create link for source
        Map<QName, Serializable> linkProperties = new HashMap<QName, Serializable>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(destination.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, destination.getShortName());
        ChildAssociationRef sourceChildRef = nodeService.createNode(sourceDocumentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);
        NodeRef sourceRef = sourceChildRef.getChildRef();

        // create link for destination
        linkProperties = new HashMap<QName, Serializable>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(source.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK_TARGET, source.getShortName());
        ChildAssociationRef destinationChildRef = nodeService.createNode(destDocumentLib, ContentModel.ASSOC_CONTAINS,
                OpenDeskModel.PROP_LINK, OpenDeskModel.PROP_LINK, linkProperties);
        NodeRef destinationRef = destinationChildRef.getChildRef();


        // for easy deletion of the links, we do a save of the nodeRefs on each side
        nodeService.setProperty(sourceRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF, destinationRef);
        nodeService.setProperty(destinationRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF, sourceRef);

        Map<String, Serializable> map = new HashMap<>();
        map.put("sourceLinkRef", sourceRef);
        map.put("destinationLinkRef", destinationRef);

        return Utils.getJSONReturnArray(map);
    }

    /**
     * Deletes a link.
     * (method = deleteLink)
     * @param source nodeRef of source link.
     * @param destination nodeRef of destination link.
     * @return JSONSuccess.
     */
    private JSONArray deleteLink(NodeRef source, NodeRef destination) {

        nodeService.deleteNode(source);
        nodeService.deleteNode(destination);
        return Utils.getJSONSuccess();
    }

    /**
     * Gets the type of a site
     * (method = getSiteType)
     * @param siteShortName shortname of a site.
     * @return a JSONArray containing type.
     */
    private JSONArray getSiteType(String siteShortName) {

        NodeRef nodeRef = siteService.getSite(siteShortName).getNodeRef();
        String type = Utils.getSiteType(nodeService, nodeRef);
        return Utils.getJSONReturnPair("type", type);
    }

    /**
     * Gets all groups of a type of site.
     * (method = getSiteGroups)
     * @param siteType type of site.
     * @return a JSONArray containing a JSONObject for each group.
     */
    private JSONArray getSiteGroups(String siteType) throws JSONException {

        JSONArray result = new JSONArray();
        for (Object groupObject :  Utils.siteGroups.get(siteType)) {
            JSONObject groupJSON = (JSONObject) groupObject;
            result.add(groupJSON);
        }
        return result;
    }

    /**
     * Converts a site into a standard structured JSONObject.
     * @param s site info.
     * @return a JSONObject representing the site.
     */
    private JSONObject convertSiteInfoToJSON(SiteInfo s) throws JSONException {
        JSONObject json = new JSONObject();
        String siteShortName = s.getShortName();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        json.put("created", sdf.format(s.getCreatedDate()));
        json.put("modified", sdf.format(s.getLastModifiedDate()));

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

            String projectManagerGroup = Utils.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTMANAGER);
            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, projectManagerGroup, true);
            if (authorities.iterator().hasNext())
            manager = authorities.iterator().next();

            String projectOwnerGroup = Utils.getAuthorityName(siteShortName, OpenDeskModel.PD_GROUP_PROJECTOWNER);
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

            String SiteManager = Utils.getAuthorityName(siteShortName, "SiteManager");
            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, SiteManager, true);
            if (authorities.iterator().hasNext())
                manager = authorities.iterator().next();
        }

        //Get Manager
        if (!manager.isEmpty()) {
            NodeRef managerRef = personService.getPerson(manager);
            JSONObject managerObj = Utils.convertUserToJSON(nodeService, preferenceService, managerRef);
            json.put("manager", managerObj);
        }

        //Get Owner
        if (!owner.isEmpty()) {
            NodeRef ownerRef = personService.getPerson(owner);
            JSONObject ownerObj = Utils.convertUserToJSON(nodeService, preferenceService, ownerRef);
            json.put("owner", ownerObj);
        }

        //Get Creator
        String creator = nodeService.getProperty(n, ContentModel.PROP_CREATOR).toString();
        NodeRef creatorRef = personService.getPerson(creator);
        JSONObject creatorObj = Utils.convertUserToJSON(nodeService, preferenceService, creatorRef);
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
    }

    /**
     * Gets information of a site.
     * (method = getSite)
     * @param shortName short name of the site.
     * @return a JSONObject representing the site.
     */
    private JSONArray getSiteInfo(String shortName) throws JSONException {

        SiteInfo siteInfo = siteService.getSite(shortName);
        JSONArray json = new JSONArray();
        json.add(convertSiteInfoToJSON(siteInfo));
        return json;
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
                JSONObject json = convertSiteInfoToJSON(s);
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
    private JSONArray getTemplates() throws JSONException {
        return getSitesWithAspect(OpenDeskModel.ASPECT_PD_TEMPLATE_SITES);
    }

    /**
     * Creates a site.
     * (method = createSite)
     * @param displayName display name of the site.
     * @param description description of the site.
     * @param site_visibility visibility of the site.
     * @return a JSONObject representing the site.
     */
    private JSONArray createSite(String displayName, String description, SiteVisibility site_visibility)
            throws JSONException {

        NodeRef nodeRef = Utils.createSite(nodeService, contentService, siteService, displayName,
                description, site_visibility);

        return getSiteInfo(siteService.getSiteShortName(nodeRef));
    }

    /**
     * Creates a site template.
     * (method = createTemplate)
     * @param displayName display name of the site template.
     * @param description description of the site template.
     * @return a JSONObject representing the site template.
     */
    private JSONArray createTemplate(String displayName, String description) throws JSONException {

        NodeRef nodeRef = Utils.createSite(nodeService, contentService, siteService, displayName,
                description, SiteVisibility.PUBLIC);
        makeSiteATemplate(nodeRef);
        return getSiteInfo(siteService.getSiteShortName(nodeRef));
    }

    /**
     * Makes a site into a site template.
     * (method = makeSiteATemplate)
     * @param shortName short name of the site to be made into a site template.
     * @return JSONSuccess.
     */
    private JSONArray makeSiteATemplate(String shortName) {

        SiteInfo s = siteService.getSite(shortName);
        return makeSiteATemplate(s.getNodeRef());
    }

    /**
     * Makes a site into a site template.
     * @param nodeRef of the site to be made into a site template.
     * @return JSONSuccess.
     */
    private JSONArray makeSiteATemplate(NodeRef nodeRef) {

        Map<QName, Serializable> aspectProps = new HashMap<>();
        nodeService.addAspect(nodeRef, OpenDeskModel.ASPECT_PD_TEMPLATE_SITES, aspectProps);
        return Utils.getJSONSuccess();
    }

    /**
     * Creates a PDF containing information about the members of the site.
     * (method = createMembersPDF)
     * @param siteShortName short name of a site.
     * @return a JSONArray containing nodeRef to the PDF.
     */
    private JSONArray createMembersPDF(String siteShortName) throws JSONException {

        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // ...code to be run as Admin...

            SiteInfo site = siteService.getSite(siteShortName);
            String output = "Medlemsliste for projektet: " + site.getTitle() + "\n\n\n\n\n";

            // Print members
            NodeRef nodeRef = siteService.getSite(siteShortName).getNodeRef();
            String type = Utils.getSiteType(nodeService, nodeRef);

            for (Object groupObject :  Utils.siteGroups.get(type)) {
                JSONObject groupJSON = (JSONObject) groupObject;
                String shortName = groupJSON.getString("shortName");
                output += getAuthorityMembersToString(siteShortName, shortName) + "\n\n";
            }

            // delete the pdf if it is already present
            NodeRef documentLib = siteService.getContainer(site.getShortName(), OpenDeskModel.DOC_LIBRARY);
            NodeRef pdfNode = nodeService.getChildByName(documentLib, ContentModel.ASSOC_CONTAINS, ISO9075.encode("Medlemsoversigt.pdf"));

            if (pdfNode != null) {
                nodeService.deleteNode(pdfNode);
            }

            // Create new PDF
            Map<QName, Serializable> documentLibaryProps = new HashMap<QName, Serializable>();
            documentLibaryProps.put(ContentModel.PROP_NAME, "Medlemsoversigt.pdf");

            ChildAssociationRef child = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(ContentModel.USER_MODEL_URI, "tempfile1"), ContentModel.TYPE_CONTENT);
            ChildAssociationRef pdf = nodeService.createNode(documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(ContentModel.USER_MODEL_URI, "thePDF"), ContentModel.TYPE_CONTENT, documentLibaryProps);

            // hide the pdf from the users
            Map<QName, Serializable> aspectProps = new HashMap<QName, Serializable>();
            nodeService.addAspect(pdf.getChildRef(), ContentModel.ASPECT_HIDDEN, aspectProps);

            // Write to the new PDF
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

    /**
     * Gets authority members as a double line break separated string.
     * Used by createMembersPDF
     * @param siteShortName short name of a site.
     * @param groupName group name.
     * @return group members.
     */
    private String getAuthorityMembersToString(String siteShortName, String groupName) {
        String group = Utils.getAuthorityName(siteShortName, groupName);
        String groupMembers = groupName + ": \n\n";
        Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);
        for (String authority : authorities) {
            NodeRef person = personService.getPerson(authority);
            groupMembers += nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";
        }
        return groupMembers;
    }

    /**
     * Deletes a site.
     * (method = deleteSite)
     * @param siteShortName short name of a site.
     * @return JSONSuccess.
     */
    public JSONArray deleteSite(String siteShortName) {

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
        String authority = Utils.getAuthorityName(siteShortName, "");
        authorityService.deleteAuthority(authority, true);

        return Utils.getJSONSuccess();
    }

    /**
     * Gets the next available file name for a new file.
     * @param destination nodeRef of the destination folder.
     * @param nodeName original name of the new file.
     * @return the next available file name.
     */
    private JSONArray returnFileName (String destination, String nodeName) {

        NodeRef destinationNodeRef = new NodeRef(destination);
        String fileName = Utils.getFileName(nodeService, destinationNodeRef, nodeName);
        return Utils.getJSONReturnPair("fileName", fileName);
    }
}