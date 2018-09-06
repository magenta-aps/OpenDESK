package dk.opendesk.repo.beans;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.query.PagingRequest;
import org.alfresco.query.PagingResults;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.Pair;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;

import java.util.ArrayList;
import java.util.List;

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

    public JSONArray findAuthorities(String filter) throws JSONException {
        return findAuthorities(filter, true, null);
    }

    public JSONArray findAuthorities(String filter, List<String> ignoreList) throws JSONException {
        return findAuthorities(filter, true, ignoreList);
    }

    private JSONArray findAuthorities(String filter, boolean includeGroups, List<String> ignoreList) throws JSONException {

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
                    AuthorityService.ZONE_APP_DEFAULT, "*" + filter, true, true,
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
                JSONObject json = Utils.convertGroupToJSON(authorityService, authorityName);
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
