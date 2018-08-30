package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class PersonBean {

    private MutableAuthenticationService mutableAuthenticationService;
    private NodeService nodeService;
    private PersonService personService;
    private Properties properties;
    private SearchService searchService;
    private SiteService siteService;

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
        String password = Utils.generateNewPassword();
        mutableAuthenticationService.createAuthentication(userName, password.toCharArray());
        return password;
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

    /**
     * Converts a user into a standard structured JSONObject.
     * @param userName the name of the user to be converted.
     * @return a JSONObject representing the user.
     */
    public JSONObject getPerson(String userName) throws JSONException {
        NodeRef userRef = personService.getPerson(userName);
        return Utils.convertUserToJSON(nodeService, userRef);
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

        model.put("group", Utils.getPDGroupTranslation(groupName));

        String protocol = properties.getProperty("openDesk.protocol");
        String host = properties.getProperty("openDesk.host");
        model.put("login", protocol + "://" + host + "/login");
        return model;
    }

    private boolean userNameExists(String userName) {
        return !userName.isEmpty() && personService.personExists(userName);
    }

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
