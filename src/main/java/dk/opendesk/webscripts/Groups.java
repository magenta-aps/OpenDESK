package dk.opendesk.webscripts;

/**
 * Created by flemmingheidepedersen on 10/10/2016.
 */


import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.*;

import java.io.IOException;
import java.util.*;

/**
 *
 * @author flemming
 */
public class Groups extends AbstractWebScript {

    final Logger logger = LoggerFactory.getLogger(Groups.class);

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }

    private SearchService searchService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    private SiteService siteService;


    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    private NodeService nodeService;

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    private AuthorityService authorityService;

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    private PersonService personService;

    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private PermissionService permissionService;

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        String shortName = params.get("shortName");
        String groupName = params.get("groupName");
        String method = params.get("method");

        System.out.println(shortName);
        System.out.println(groupName);

        if (method != null && method.equals("getAllMembers")) {

            JSONArray result = this.getAllMembers(shortName, groupName);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

    private long getDBID(String siteShortName) {

        SiteInfo site = siteService.getSite(siteShortName);

        NodeRef nodeRef = site.getNodeRef();

        Long siteID = (Long)nodeService.getProperty(nodeRef, ContentModel.PROP_NODE_DBID);

        return siteID;
    }

    private void errorMessage(Status status, int code, final String message) {
        status.setCode(code);
        status.setMessage(message);
        status.setRedirect(true);
    }

    private JSONArray getAllMembers(String shortName, String groupName) {




        NodeRef siteNodeRef = siteService.getSite(shortName).getNodeRef();


        JSONArray result = new JSONArray();
        JSONArray members = new JSONArray();
        JSONObject json = new JSONObject();

        String group = "GROUP_"  + getDBID(shortName) + "_" + groupName;
        Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);



        Set<AccessPermission> permissions = permissionService.getAllSetPermissions(siteNodeRef);

        Iterator i = permissions.iterator();
        boolean found = false;
        String permission = "";

        while (i.hasNext() && !found) {
            AccessPermission a = (AccessPermission)i.next();

            if (a.getAuthority().equals(group)) {
                System.out.println("permission");
                System.out.println(a.getPermission());
                permission = a.getPermission();

                try {
                    json.put("permission",permission);
                    result.add(json);
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                found = true;
            }
        }

        for (String authority : authorities) {
            System.out.println(authority);
            NodeRef person = personService.getPerson(authority);
            String name  = (String)nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String)nodeService.getProperty(person, ContentModel.PROP_LASTNAME);
            String email  = (String)nodeService.getProperty(person, ContentModel.PROP_EMAIL);

            json = new JSONObject();

            try {
                json.put("displayName", name);
                json.put("email", email);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            members.add(json);
        }

        result.add(members);

        return result;
    }
}
