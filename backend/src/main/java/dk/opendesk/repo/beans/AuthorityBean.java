package dk.opendesk.repo.beans;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.query.PagingRequest;
import org.alfresco.query.PagingResults;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.Pair;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.*;

import static dk.opendesk.repo.model.OpenDeskModel.ORGANIZATIONAL_CENTERS;
import static dk.opendesk.repo.model.OpenDeskModel.PROJECT_OWNERS;

public class AuthorityBean {
    private AuthorityService authorityService;
    private NodeService nodeService;
    private PersonService personService;

    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setNodeService(NodeService nodeService) { this.nodeService = nodeService; }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    public JSONArray getAuthorities(String groupName) throws JSONException {
        Set<String> authorities = getAuthorityList(groupName);
        return getAuthorityToJSON(authorities);

    }

    public Set<String> getAuthorityList(String groupName) {
        return authorityService.getContainedAuthorities(null, groupName, true);
    }

    private JSONArray getAuthorityToJSON(Set<String> authorities) throws JSONException {
        JSONArray result = new JSONArray();
        for (String authorityName : authorities) {
            JSONObject json;
            if(authorityName.startsWith("GROUP_")) {
                json = getGroupInfo(authorityName);
            }
            else {
                NodeRef user = personService.getPerson(authorityName);
                json = Utils.convertUserToJSON(nodeService, user);
            }
            result.add(json);
        }

        return result;
    }

    /**
     * Converts a group into a standard structured JSONObject.
     * @param fullName the group to be converted.
     * @return a JSONObject representing the group.
     */
    private JSONObject getGroupInfo (String fullName) throws JSONException {
        JSONObject json = new JSONObject();
        String shortName = fullName.substring(6);
        json.put("shortName", shortName);
        json.put("fullName", fullName);
        String displayName = authorityService.getAuthorityDisplayName(fullName);
        json.put("displayName", displayName);
        return json;
    }

    public JSONObject getOpenDeskGroup(String groupName) throws JSONException {
        Map<String, String> odGroups = getOpenDeskGroupObjects();
        String type = odGroups.get(groupName);
        JSONObject json = new JSONObject();
        json.put("shortName", groupName);
        json.put("type", type);
        JSONArray authorities = getAuthorities("GROUP_" + groupName);
        json.put("members", authorities);
        return json;
    }

    private Map<String, String> getOpenDeskGroupObjects() {
        Map<String, String> odGroups = new HashMap<>();
        odGroups.put(PROJECT_OWNERS, "USER");
        odGroups.put(ORGANIZATIONAL_CENTERS, "GROUP");
        return odGroups;
    }

    public JSONArray getOpenDeskGroups() throws JSONException {
        Map<String, String> odGroups = getOpenDeskGroupObjects();
        JSONArray result = new JSONArray();
        for (Map.Entry<String, String> group : odGroups.entrySet()) {
            JSONObject json = getOpenDeskGroup(group.getKey());
            result.add(json);
        }
        return result;
    }

    public Set<String> getUserList(String groupName) {
        return authorityService.getContainedAuthorities(AuthorityType.USER, groupName, false);
    }

    public JSONArray getUsers(String groupName) throws JSONException {
        Set<String> userNames = getUserList(groupName);
        return getAuthorityToJSON(userNames);

    }

    public JSONArray findAuthorities(String filter) throws JSONException {
        return findAuthorities(filter, true, null);
    }

    public JSONArray findAuthorities(String filter, List<String> ignoreList) throws JSONException {
        return findAuthorities(filter, true, ignoreList);
    }

    private JSONArray findAuthorities(String filter, boolean includeGroups, List<String> ignoreList) throws JSONException {
        if(filter == null)
            filter = "";

        List<QName> filterProps = new ArrayList<>();
        filterProps.add(ContentModel.PROP_FIRSTNAME);
        filterProps.add(ContentModel.PROP_LASTNAME);

        List<Pair<QName,Boolean>> sortProps = new ArrayList<>();
        sortProps.add(new Pair<>(ContentModel.PROP_FIRSTNAME, true));
        JSONArray result = new JSONArray();

        PagingResults<PersonService.PersonInfo> users = personService.getPeople(filter, filterProps, sortProps, new PagingRequest(100000));
        for (PersonService.PersonInfo user : users.getPage()) {
            // Do not add users that are on the ignore list
            if(ignoreList != null && ignoreList.contains(user.getUserName()))
                continue;
            JSONObject json = Utils.convertUserToJSON(nodeService, user.getNodeRef());
            result.add(json);
        }

        // Only add groups if they need to be included
        if(includeGroups) {
            PagingResults<String> groupResults = authorityService.getAuthorities(AuthorityType.GROUP,
                    AuthorityService.ZONE_AUTH_ALFRESCO, "*" + filter, true, true,
                    new PagingRequest(100000));
            for (String authorityName : groupResults.getPage()) {
                if (authorityName.startsWith("GROUP_ALFRESCO") ||
                        authorityName.startsWith("GROUP_OPENDESK") ||
                        authorityName.startsWith("GROUP_EMAIL") ||
                        authorityName.startsWith("GROUP_SITE") ||
                        authorityName.startsWith("GROUP_site"))
                    continue;
                // Do not add groups that are on the ignore list
                if(ignoreList != null && ignoreList.contains(authorityName))
                    continue;
                JSONObject json = getGroupInfo(authorityName);
                result.add(json);
            }
        }

        return result;
    }

    public JSONArray findUsers(String filter) throws JSONException {
        return findAuthorities(filter, false, null);
    }

    public JSONArray findUsers(String filter, List<String> ignoreList) throws JSONException {
        return findAuthorities(filter, false, ignoreList);
    }
}
