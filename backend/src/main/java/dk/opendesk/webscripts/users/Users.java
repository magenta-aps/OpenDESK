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
package dk.opendesk.webscripts.users;

import dk.opendesk.repo.beans.AuthorityBean;
import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.*;
import java.util.*;

public class Users extends AbstractWebScript {
    private AuthorityBean authorityBean;

    private PersonService personService;
    private NodeService nodeService;
    private AuthorityService authorityService;
    private MutableAuthenticationService mutableAuthenticationService;
    private ActionService actionService;
    private SearchService searchService;
    private SiteService siteService;
    private Properties properties;

    public void setAuthorityBean(AuthorityBean authorityBean) {
        this.authorityBean = authorityBean;
    }

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setNodeService(NodeService nodeService) { this.nodeService = nodeService; }
    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setMutableAuthenticationService(MutableAuthenticationService mutableAuthenticationService) {
        this.mutableAuthenticationService = mutableAuthenticationService;
    }
    public void setActionService (ActionService actionService) {
        this.actionService = actionService;
    }
    public void setSearchService (SearchService searchService) {
        this.searchService = searchService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setProperties (Properties properties) {
        this.properties = properties;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer writer = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String userName = Utils.getJSONObject(json, "PARAM_USERNAME");
            String firstName = Utils.getJSONObject(json, "PARAM_FIRSTNAME");
            String lastName = Utils.getJSONObject(json, "PARAM_LASTNAME");
            String email = Utils.getJSONObject(json, "PARAM_EMAIL");
            String telephone = Utils.getJSONObject(json, "PARAM_TELEPHONE");
            String siteShortName = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");
            String groupName = Utils.getJSONObject(json, "PARAM_GROUP_NAME");
            String subject = Utils.getJSONObject(json, "PARAM_SUBJECT");
            String body = Utils.getJSONObject(json, "PARAM_BODY");
            String filter = Utils.getJSONObject(json, "PARAM_FILTER");

            if(method != null) {
                switch (method) {
                    case "createExternalUser":
                        if(userName.isEmpty())
                            result = createExternalUserWithoutUserName(firstName, lastName, email, telephone,
                                    siteShortName,  groupName);
                        else
                            result = createExternalUser(userName, firstName, lastName, email, telephone,
                                    siteShortName, groupName);
                        break;

                    case "sendEmail":
                        result = sendEmail(userName, subject, body);
                        break;

                    case "findAuthorities":
                        result = findAuthorities(filter);
                        break;

                    case "findUsers":
                        result = findUsers(filter);
                        break;

                    case "validateNewUser":
                        result = validateNewUser(userName, email);
                        break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(writer, result);
    }

    private JSONArray validateNewUser (String userName, String email) throws JSONException {
        boolean userNameExists = userNameExists(userName);
        boolean emailExists = emailExists(email);
        boolean isValid = !emailExists && !userNameExists;
        JSONArray result = new JSONArray();
        JSONObject obj = new JSONObject();
        obj.put("isValid", isValid);
        obj.put("userNameExists", userNameExists);
        obj.put("emailExists", emailExists);
        result.add(obj);
        return result;
    }

    private boolean userNameExists (String userName) {
        return !userName.isEmpty() && personService.personExists(userName);
    }

    private boolean emailExists (String email) {

        String query = "TYPE:\"cm:person\" AND @cm\\:email:\"" + email + "\"";
        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);

        return siteSearchResult.getNumberFound() >= 1;
    }

    /**
     * Creates an external user.
     * The new user is sent an invitation email to its email address.
     * (method = createExternalUser)
     * @param userName of the external user.
     * @param firstName of the external user.
     * @param lastName of the external user.
     * @param email of the external user.
     * @param telephone of the external user.
     * @param siteShortName short name of the site that the external user is added.
     * @param groupName name of the site group that the external user is added to.
     * @param password of the external user.
     * @return a string containing the rendered email template.
     */
    private String renderInviteUserTemplate(String userName, String firstName, String lastName, String email,
                                          String telephone, String siteShortName, String groupName, String password) {
        String senderUsername = mutableAuthenticationService.getCurrentUserName();

        // Notify external user
        Map<String, Object> model = new HashMap<>();

        NodeRef senderRef = personService.getPerson(senderUsername);
        Serializable senderFirstName = nodeService.getProperty(senderRef, ContentModel.PROP_FIRSTNAME);
        Serializable senderLastName = nodeService.getProperty(senderRef, ContentModel.PROP_LASTNAME);
        Serializable senderEmail = nodeService.getProperty(senderRef, ContentModel.PROP_EMAIL);
        model.put("senderUsername", senderUsername);
        model.put("senderFirstName", senderFirstName);
        model.put("senderLastName", senderLastName);
        model.put("senderEmail", senderEmail);

        model.put("userName", userName);
        model.put("firstName", firstName);
        model.put("lastName", lastName);
        model.put("email", email);
        model.put("telephone", telephone);
        model.put("password", password);

        SiteInfo site = siteService.getSite(siteShortName);
        NodeRef siteRef = site.getNodeRef();

        Serializable siteName, siteType;
        if(nodeService.hasAspect(siteRef, OpenDeskModel.ASPECT_PD)) {
            siteName = nodeService.getProperty(siteRef, OpenDeskModel.PROP_PD_NAME);
            siteType = "projektet";
        }
        else {
            siteName = nodeService.getProperty(siteRef, ContentModel.PROP_TITLE);
            siteType = "grupperummet";
        }
        model.put("siteName", siteName);
        model.put("siteType", siteType);

        model.put("group", Utils.getPDGroupTranslation(groupName));

        String protocol = properties.getProperty("openDesk.protocol");
        String host = properties.getProperty("openDesk.host");
        model.put("login", protocol + "://" + host + "/login");

        Writer writer = new StringWriter();
        String templatePath = "OpenDesk/Templates/Emails/" + OpenDeskModel.TEMPLATE_EMAIL_INVITE_EXTERNAL_USER;
        renderTemplate(templatePath, model, writer);
        return writer.toString();
    }

    private JSONArray sendEmail(String userName, String subject, String body) {
        if(!personService.personExists(userName))
            throw new UsernameNotFoundException("User " + userName + " not found.");

        NodeRef person = personService.getPerson(userName);
        Serializable to = nodeService.getProperty(person, ContentModel.PROP_EMAIL);
        String from = properties.getProperty("mail.from.default");
        Utils.sendEmail(actionService, searchService, subject, body, to, from);
        return Utils.getJSONSuccess();
    }

    /**
     * Creates an external user without user name.
     * The new user is sent an invitation email to its email address.
     * (method = createExternalUser)
     * @param firstName of the external user.
     * @param lastName of the external user.
     * @param email of the external user.
     * @param telephone of the external user.
     * @param siteShortName short name of the site that the external user is added.
     * @param groupName name of the site group that the external user is added to.
     * @return a JSONArray containing the rendered email template and email subject.
     */
    private JSONArray createExternalUserWithoutUserName(String firstName, String lastName, String email,
                                                        String telephone, String siteShortName,
                                                        String groupName) throws JSONException {
        String origUserName = (firstName + "_" + lastName).replace(" ", "_");
        String userName = origUserName;

        int i = 2;
        while (personService.personExists(userName)) {
            userName = origUserName + "_" + i++;
        }
        return createExternalUser(userName, firstName, lastName, email, telephone, siteShortName, groupName);
    }


    /**
     * Creates an external user.
     * The new user is sent an invitation email to its email address.
     * (method = createExternalUser)
     * @param userName of the external user.
     * @param firstName of the external user.
     * @param lastName of the external user.
     * @param email of the external user.
     * @param telephone of the external user.
     * @param siteShortName short name of the site that the external user is added.
     * @param groupName name of the site group that the external user is added to.
     * @return a JSONArray containing the rendered email template and email subject.
     */
    private JSONArray createExternalUser(String userName, String firstName, String lastName, String email,
                                    String telephone, String siteShortName, String groupName) throws JSONException {
        // ...code to be run as Admin...
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // Create new external user and set password
            Map<QName, Serializable> props = Utils.createPersonProperties(userName, firstName, lastName, email,
                    telephone);
            personService.createPerson(props);
            String password = Utils.generateNewPassword();

            mutableAuthenticationService.createAuthentication(userName, password.toCharArray());

            // Add external user to PDSite group
            String authority = Utils.getAuthorityName(siteShortName, groupName);
            authorityService.addAuthority(authority, userName);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();

            // Set username
            json.put("userName", userName);

            // Set subject
            NodeRef template = Utils.queryEmailTemplate(searchService, OpenDeskModel.TEMPLATE_EMAIL_INVITE_EXTERNAL_USER);
            if(template != null) {
                Serializable subject = nodeService.getProperty(template, ContentModel.PROP_TITLE);
                json.put("subject", subject);
            }

            // Set body
            String body = renderInviteUserTemplate(userName, firstName, lastName, email, telephone,  siteShortName,
                    groupName, password);
            json.put("body", body);

            result.add(json);
            return result;
        } finally {
            AuthenticationUtil.popAuthentication();
        }
    }

    private JSONArray findAuthorities(String filter) throws JSONException {
        return authorityBean.findAuthorities(filter);
    }

    /**
     * Gets a list of filtered users.
     * (method = findUsers)
     * @param filter search query to filter by. Leave this empty to get all users.
     * @return a JSONArray containing JSONObjects for each user.
     */
    private JSONArray findUsers(String filter) throws JSONException {
        return authorityBean.findUsers(filter);
    }
}

