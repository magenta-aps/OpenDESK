// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.PasswordGenerator;
import org.alfresco.model.ContentModel;
import org.alfresco.query.PagingRequest;
import org.alfresco.query.PagingResults;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.*;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.security.PersonService.PersonInfo;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.Content;
import org.alfresco.util.Pair;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.io.Serializable;
import java.util.*;

public class PersonBean {

    private AuthorityService authorityService;
    private MutableAuthenticationService mutableAuthenticationService;
    private NodeService nodeService;
    private PersonService personService;
    private Properties properties;
    private SearchService searchService;
    private SiteService siteService;

    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setMutableAuthenticationService(MutableAuthenticationService mutableAuthenticationService) {
        this.mutableAuthenticationService = mutableAuthenticationService;
    }
    public void setNodeService(NodeService nodeService) { this.nodeService = nodeService; }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setProperties (Properties properties) {
        this.properties = properties;
    }
    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    /**
     * Creates a person.
     * @param props of the person.
     * @return a string containing the password.
     */
    public String createPerson(Map<QName, Serializable> props) {
        // Create new person and give it a random password
        String userName = (String) props.get(ContentModel.PROP_USERNAME);
        personService.createPerson(props);
        String password = createPassword();
        mutableAuthenticationService.createAuthentication(userName, password.toCharArray());
        return password;
    }

    /**
     * Creates a new random password.
     * @return a new random password.
     */
    private String createPassword()
    {
        PasswordGenerator passwordGenerator = new PasswordGenerator.PasswordGeneratorBuilder()
                .useDigits(true)
                .useLower(true)
                .useUpper(true)
                .build();
        return passwordGenerator.generate(8); // output ex.: lrU12fmM 75iwI90o
    }

    /**
     * Creates a username for the person
     * @param firstName of the user.
     * @param lastName of the user.
     * @return a JSONArray containing the rendered email template and email subject.
     */
    private String createUserName(Serializable firstName, Serializable lastName) {
        String origUserName = (firstName + "_" + lastName).replace(" ", "_");
        String userName = origUserName;

        int i = 2;
        while (personService.personExists(userName)) {
            userName = origUserName + "_" + i++;
        }
        return userName;
    }

    /**
     * Creates a person's mapping of properties.
     * @param userName of the user.
     * @param firstName of the user.
     * @param lastName of the user.
     * @param email of the user.
     * @return a map of properties.
     */
    public Map<QName, Serializable> createPersonProperties(String userName, String firstName, String lastName,
                                                           String email, String telephone) {
        Map<QName, Serializable> properties = new HashMap<>();
        // If username was not supplied then create one
        if(userName.isEmpty())
            userName = createUserName(firstName, lastName);
        properties.put(ContentModel.PROP_USERNAME, userName);
        properties.put(ContentModel.PROP_FIRSTNAME, firstName);
        properties.put(ContentModel.PROP_LASTNAME, lastName);
        properties.put(ContentModel.PROP_EMAIL, email);
        properties.put(ContentModel.PROP_TELEPHONE, telephone);
        return properties;
    }

    private boolean emailExists(String email) {
        String query = "TYPE:\"cm:person\" AND @cm\\:email:\"" + email + "\"";
        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
        ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);

        return siteSearchResult.getNumberFound() >= 1;
    }

    public String getDisplayName(NodeRef person) {
        String firstName = (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME);
        String lastName = (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME);
        return (firstName + " " + lastName).trim();
    }

    public String getDisplayName(String userName) {
        if (personService.personExists(userName)) {
            NodeRef person = personService.getPerson(userName);
            return getDisplayName(person);
        }
        return null;
    }

    public NodeRef getPerson(String userName) {
        return personService.getPerson(userName);
    }

    /**
     * Converts a person into a standard structured JSONObject.
     * @param person the nodeRef of the user to be converted.
     * @return a JSONObject representing the user.
     */
    public JSONObject getPersonInfo (NodeRef person) throws JSONException {
        JSONObject json = new JSONObject();

        String userName = (String) nodeService.getProperty(person, ContentModel.PROP_USERNAME);
        json.put("userName", userName);

        String firstName = (String) nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME);
        json.put("firstName", firstName);

        String lastName = (String) nodeService.getProperty(person, ContentModel.PROP_LASTNAME);
        json.put("lastName", lastName);

        String displayName = (firstName + " " + lastName).trim();
        json.put("displayName", displayName);

        String email = (String) nodeService.getProperty(person, ContentModel.PROP_EMAIL);
        json.put("email", email);

        String telephone = (String) nodeService.getProperty(person, ContentModel.PROP_TELEPHONE);
        json.put("telephone", telephone);

        String mobile = (String) nodeService.getProperty(person, ContentModel.PROP_MOBILE);
        json.put("mobile", mobile);

        String jobTitle = (String) nodeService.getProperty(person, ContentModel.PROP_JOBTITLE);
        json.put("jobTitle", jobTitle);

        String organization = (String) nodeService.getProperty(person, ContentModel.PROP_ORGANIZATION);
        json.put("organization", organization);

        String avatar;
        List<AssociationRef> assocRefs = nodeService.getTargetAssocs(person,ContentModel.ASSOC_AVATAR);
        if(assocRefs.size() > 0) {
            NodeRef avatarNodeRef = assocRefs.get(0).getTargetRef();
            avatar = "/alfresco/s/api/node/workspace/SpacesStore/" + avatarNodeRef.getId() + "/content";
        }
        else
            avatar = "assets/img/avatars/blank-profile-picture.png";
        json.put("avatar", avatar);

        boolean isAdmin = authorityService.hasAdminAuthority();
        json.put("isAdmin", isAdmin);

        boolean isEnabled = personService.isEnabled(userName);
        json.put("isEnabled", isEnabled);

        return json;
    }

    /**
     * Converts a user into a standard structured JSONObject.
     * @param userName the name of the user to be converted.
     * @return a JSONObject representing the user.
     */
    public JSONObject getPersonInfo (String userName) throws JSONException {
        if(personService.personExists(userName)) {
            NodeRef personRef = personService.getPerson(userName);
            return getPersonInfo(personRef);
        }
        return null;
    }

    /**
     * Creates an external user.
     * The new user is sent an invitation email to its email address.
     * @param props of the external user.
     * @param siteShortName short name of the site that the external user is added.
     * @param groupName name of the site group that the external user is added to.
     * @param password of the external user.
     * @return a string containing the rendered email template.
     */
    public Map<String, Object> getInviteExternalUserModel(Map<QName, Serializable> props, String siteShortName,
                                                          String groupName, String password) {
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

        Serializable userName = props.get(ContentModel.PROP_USERNAME);
        Serializable firstName = props.get(ContentModel.PROP_FIRSTNAME);
        Serializable lastName = props.get(ContentModel.PROP_LASTNAME);
        Serializable email = props.get(ContentModel.PROP_EMAIL);
        Serializable telephone = props.get(ContentModel.PROP_TELEPHONE);
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

        String groupTranslation = getPDGroupTranslation(groupName);
        if(groupTranslation != null)
            model.put("group", groupTranslation);

        String protocol = properties.getProperty("openDesk.protocol");
        String host = properties.getProperty("openDesk.host");
        model.put("login", protocol + "://" + host + "/login");
        return model;
    }

    /**
     * Gets the danish translation for Project Department groups.
     * @param group the short name of the group to translate.
     * @return the translated string.
     */
    private String getPDGroupTranslation(String group)
    {
        switch(group) {
            case "PD_PROJECTOWNER":
                return "Projektejere";
            case "PD_PROJECTMANAGER":
                return "Projektledere";
            case "PD_PROJECTGROUP":
                return "Projektgruppe";
            case "PD_WORKGROUP":
                return "Arbejdsgruppe";
            case "PD_MONITORS":
                return "Følgegruppe";
            case "PD_STEERING_GROUP":
                return "Styregruppe";
        }
        return null;
    }

    public JSONArray searchPersons(String filter, List<String> ignoreList) throws JSONException {
        if(filter == null)
            filter = "";

        List<QName> filterProps = new ArrayList<>();
        filterProps.add(ContentModel.PROP_FIRSTNAME);
        filterProps.add(ContentModel.PROP_LASTNAME);

        List<Pair<QName,Boolean>> sortProps = new ArrayList<>();
//        sortProps.add(new Pair<>(ContentModel.PROP_FIRSTNAME, true));
        JSONArray result = new JSONArray();

        Set<QName> r = new HashSet<QName>();
        r.add(ContentModel.ASPECT_PERSON_DISABLED);

//        String query = "TYPE:\"cm:person\" AND !ASPECT:\"cm:personDisabled\" ";


        // separate search filter into tokens and check agains the firstName and lastName

//        query += " AND ( ";
//
//        String filterQuery = "";
//
//        String[] filterTokens = filter.split(" ");
//        System.out.println(filterTokens.length);
//
//        for (int i=0; i <= filterTokens.length-1; i++) {
//
//            String token = filterTokens[i];
//
//            if (filterQuery.length()> 0) {
//                filterQuery += " AND ";
//            }
//
//            filterQuery += " (" + "@cm\\:firstName:" + "*" + token +"*" + " OR ";
//            filterQuery += "@cm\\:lastName:" + "*" + token +"*)";
//        }
//
//        query += filterQuery + " )";
//
//        System.out.println(query);
//        StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
//        // ResultSet persons = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);
//
//        SearchParameters sp = new SearchParameters();
//        sp.addStore(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
//
//        sp.setLanguage("lucene");
//        sp.setQuery(query);
//        sp.addSort("@cm:firstName", true);
//
//        ResultSet persons = searchService.query(sp);

        PagingResults<PersonInfo> users = personService.getPeople(filter, filterProps, sortProps, new PagingRequest(Integer.MAX_VALUE));
        for (PersonInfo user : users.getPage()) {
            // Do not add users that are on the ignore list
            if (ignoreList != null && ignoreList.contains(user.getUserName()) || !personService.isEnabled(user.getUserName()))
                continue;

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("firstName", user.getFirstName());
            jsonObject.put("lastName", user.getLastName());
            jsonObject.put("userName", user.getUserName());
            jsonObject.put("displayName", user.getFirstName() + " " + user.getLastName());
            result.add(jsonObject);

        }

//        while (users.hasNext()) {
//            PersonInfo p = personService.getPerson(((ResultSetRow) i.next()).getNodeRef());
//
//            System.out.println(ignoreList.contains(p.getUserName()) + ": " + p.getUserName());
//
//            if (ignoreList != null && !ignoreList.contains(p.getUserName())) {
//
//                JSONObject jsonObject = new JSONObject();
//                jsonObject.put("firstName", p.getFirstName());
//                jsonObject.put("lastName", p.getLastName());
//                jsonObject.put("userName", p.getUserName());
//                jsonObject.put("displayName", p.getFirstName() + " " + p.getLastName());
//                result.add(jsonObject);
//            }
//        }

//
//        for (PersonInfo user : users.getPage()) {
//            // Do not add users that are on the ignore list
//            if(ignoreList != null && ignoreList.contains(user.getUserName()) || !personService.isEnabled(user.getUserName()))
//                continue;
//            JSONObject json = getPersonInfo(user.getNodeRef());
//            result.add(json);
//        }

        System.out.println("hvad er result:" + result.size());
        return result;
    }

    private boolean userNameExists(String userName) {
        return !userName.isEmpty() && personService.personExists(userName);
    }

    /**
     * Person invalid if either userName or email exists
     */
    public JSONObject validatePerson(String userName, String email) throws JSONException {
        boolean userNameExists = userNameExists(userName);
        boolean emailExists = emailExists(email);
        boolean isValid = !emailExists && !userNameExists;
        JSONObject json = new JSONObject();
        json.put("isValid", isValid);
        json.put("userNameExists", userNameExists);
        json.put("emailExists", emailExists);
        return json;
    }
}
