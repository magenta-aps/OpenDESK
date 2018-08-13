package dk.opendesk.repo.beans;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PersonService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.Set;

public class GroupBean {
    private NodeService nodeService;
    private AuthorityService authorityService;
    private PersonService personService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    public Set<String> getAuthorityList(String groupName) {
        return authorityService.getContainedAuthorities(null, groupName, true);
    }

    public JSONArray getAuthorities(String groupName) throws JSONException {
        Set<String> authorities = getAuthorityList(groupName);
        return getAuthorityToJSON(authorities);

    }

    public Set<String> getUserList(String groupName) {
        return authorityService.getContainedAuthorities(AuthorityType.USER, groupName, false);
    }

    public JSONArray getUsers(String groupName) throws JSONException {
        Set<String> userNames = getUserList(groupName);
        return getAuthorityToJSON(userNames);

    }

    private JSONArray getAuthorityToJSON(Set<String> authorities) throws JSONException {
        JSONArray result = new JSONArray();
        for (String authorityName : authorities) {
            JSONObject json;
            if(authorityName.startsWith("GROUP_")) {
                json = Utils.convertGroupToJSON(authorityService, authorityName);
            }
            else {
                NodeRef user = personService.getPerson(authorityName);
                json = Utils.convertUserToJSON(nodeService, user);
            }
            result.add(json);
        }

        return result;
    }
}
