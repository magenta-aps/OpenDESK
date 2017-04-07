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
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.*;
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
import java.util.Map;

public class Users extends AbstractWebScript {

    private PersonService personService;
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    private NodeService nodeService;
    public void setNodeService (NodeService nodeService) {
        this.nodeService = nodeService;
    }

    private AuthorityService authorityService;
    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    private MutableAuthenticationService mutableAuthenticationService;
    public void setMutableAuthenticationService(MutableAuthenticationService mutableAuthenticationService) {
        this.mutableAuthenticationService = mutableAuthenticationService;
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
        }
        catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    // also returns read notifications
    private JSONArray createExternalUser(String firstName, String lastName, String email, String siteShortName,
                                         String groupName) throws JSONException {

        String origUserName = (firstName + "_" + lastName).replace(" ", "_");
        String userName = origUserName;
        int i = 2;
        while(personService.personExists(userName))
        {
            userName = origUserName + "_" + i++;
        }

        // ...code to be run as Admin...
        AuthenticationUtil.pushAuthentication();
        try {
            AuthenticationUtil.setRunAsUserSystem();
            // Create new external user and set password
            Map<QName, Serializable> props = Utils.createPersonProperties(userName, firstName, lastName, email);
            personService.createPerson(props);
            String password = Utils.generateNewPassword();
            mutableAuthenticationService.createAuthentication(userName, password.toCharArray());

            // Notify new external user
            personService.notifyPerson(userName, password);

            // Add external user to PDSite group
            String authority = Utils.getAuthorityName(siteShortName, groupName);
            authorityService.addAuthority(authority, userName);

        } finally {
            AuthenticationUtil.popAuthentication();
        }

        JSONArray result = new JSONArray();
        return result;
    }
}

