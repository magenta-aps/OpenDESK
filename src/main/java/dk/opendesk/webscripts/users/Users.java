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

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.i18n.MessageService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.template.TemplateNode;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
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
import java.util.Properties;

public class Users extends AbstractWebScript {

    private PersonService personService;
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    private AuthorityService authorityService;
    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    private MutableAuthenticationService mutableAuthenticationService;
    public void setMutableAuthenticationService(MutableAuthenticationService mutableAuthenticationService) {
        this.mutableAuthenticationService = mutableAuthenticationService;
    }

    private ActionService actionService;
    public void setActionService (ActionService actionService) {
        this.actionService = actionService;
    }

    private SearchService searchService;
    public void setSearchService (SearchService searchService) {
        this.searchService = searchService;
    }

    private MessageService messageService;
    public void setMessageService (MessageService messageService) {
        this.messageService = messageService;
    }

    private SiteService siteService;
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    private Properties properties;
    public void setProperties (Properties properties) {
        this.properties = properties;
    }

    private ServiceRegistry serviceRegistry;
    public void setServiceRegistry (ServiceRegistry serviceRegistry) {
        this.serviceRegistry = serviceRegistry;
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
            String firstName = Utils.getJSONObject(json, "PARAM_FIRSTNAME");
            String lastName = Utils.getJSONObject(json, "PARAM_LASTNAME");
            String email = Utils.getJSONObject(json, "PARAM_EMAIL");
            String siteShortName = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");
            String groupName = Utils.getJSONObject(json, "PARAM_GROUP_NAME");

            if(method != null) {
                switch (method) {
                    case "createExternalUser":
                        result = this.createExternalUser(firstName, lastName, email, siteShortName, groupName);
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

    private JSONArray createExternalUser(String firstName, String lastName, String email, String siteShortName,
                                         String groupName) throws Exception {

        String origUserName = (firstName + "_" + lastName).replace(" ", "_");
        String userName = origUserName;

        int i = 2;
        while (personService.personExists(userName)) {
            userName = origUserName + "_" + i++;
        }
        String inviterUsername = mutableAuthenticationService.getCurrentUserName();

        // ...code to be run as Admin...
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // Create new external user and set password
            Map<QName, Serializable> props = Utils.createPersonProperties(userName, firstName, lastName, email);
            NodeRef inviteePersonRef = personService.createPerson(props);
            String password = Utils.generateNewPassword();

            mutableAuthenticationService.createAuthentication(userName, password.toCharArray());

            // Add external user to PDSite group
            String authority = Utils.getAuthorityName(siteShortName, groupName);
            authorityService.addAuthority(authority, userName);

            // Notify external user
            Map<String, Serializable> templateArgs = new HashMap<>();
            NodeRef inviterPersonRef = personService.getPerson(inviterUsername);
            templateArgs.put("inviterPerson", new TemplateNode(inviterPersonRef, serviceRegistry, null));
            templateArgs.put("inviteePerson", new TemplateNode(inviteePersonRef, serviceRegistry, null));
            templateArgs.put("inviteePassword", password);
            NodeRef siteRef = siteService.getSite(siteShortName).getNodeRef();
            templateArgs.put("site", new TemplateNode(siteRef, serviceRegistry, null));
            templateArgs.put("group", Utils.getPDGroupTranslation(groupName));
            String protocol = properties.getProperty("openDesk.protocol");
            String host = properties.getProperty("openDesk.host");
            templateArgs.put("loginURL", protocol + "://" + host + "/#!/login");

            Utils.sendInviteUserEmail(messageService, actionService, searchService, properties, email, templateArgs);

        } finally {
            AuthenticationUtil.popAuthentication();
        }
        return Utils.getJSONReturnPair("userName", userName);
    }
}

