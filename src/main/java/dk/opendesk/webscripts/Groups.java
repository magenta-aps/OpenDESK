package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.*;
import org.alfresco.service.cmr.site.SiteService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.*;

import java.io.IOException;
import java.io.Writer;
import java.util.*;

public class Groups extends AbstractWebScript {

    final Logger logger = LoggerFactory.getLogger(Groups.class);

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


    // todo to be extended when the proper implementation of change permission for a single user is implemented
    private String translatePermission(String permission) {
        switch(permission.replaceFirst("Site", "")) {
            case OpenDeskModel.COLLABORATOR:
            case OpenDeskModel.MANAGER:
            case OpenDeskModel.OWNER:
                return OpenDeskModel.COLLABORATOR_DANISH;
            case OpenDeskModel.CONSUMER:
                return OpenDeskModel.CONSUMER_DANISH;
        }
        return null;
    }


    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());

            // Read all used parameters no matter what method is used.
            // Those parameters that are not sent are set to an empty string
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String groupName = Utils.getJSONObject(json, "PARAM_GROUP_NAME");
            String shortName = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");

            if(method != null) {
                switch (method) {
                    case "getAllMembers":
                        result = this.getAllMembers(shortName, groupName);
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

    private JSONArray getAllMembers(String shortName, String groupName) throws JSONException {

        NodeRef siteNodeRef = siteService.getSite(shortName).getNodeRef();

        JSONArray result = new JSONArray();
        JSONArray members = new JSONArray();
        JSONObject json = new JSONObject();

        String group = Utils.getAuthorityName(shortName, groupName);
        Boolean onlyDirectMembers = true;
        if (groupName.isEmpty())
            onlyDirectMembers = false;

        Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.USER, group, onlyDirectMembers);

        Set<AccessPermission> permissions = permissionService.getAllSetPermissions(siteNodeRef);

        String permission = Utils.getGroupUserRole(authorityService, permissions, group);
        if (permission != null) {
            json.put("permission", this.translatePermission(permission));
            result.add(json);
        }

        for (String authority : authorities) {
            NodeRef person = personService.getPerson(authority);
            String username = (String) nodeService.getProperty(person, ContentModel.PROP_USERNAME);
            String displayName = nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(person, ContentModel.PROP_LASTNAME);
            String email = (String) nodeService.getProperty(person, ContentModel.PROP_EMAIL);

            json = new JSONObject();

            json.put("username", username);
            json.put("displayName", displayName);
            json.put("email", email);

            members.add(json);
        }

        result.add(members);

        return result;
    }
}
