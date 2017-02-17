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
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 *
 * @author flemming
 */
public class Groups extends AbstractWebScript {

    final Logger logger = LoggerFactory.getLogger(Groups.class);


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

        String groupName = params.get("groupName");
        String method = params.get("method");

        if (method != null && method.equals("getAllMembers")) {

            JSONArray result = this.getAllMembers(groupName);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

    private void errorMessage(Status status, int code, final String message) {
        status.setCode(code);
        status.setMessage(message);
        status.setRedirect(true);
    }

    private JSONArray getAllMembers(String groupName) {



        String group = "GROUP_" + groupName;
        Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.WILDCARD, group, true);





        // permissionService.getPermissions()


        // du skal hente rettighed for gruppen - og returnere det i json som en værdi, samt yderligere de personer som er medlem


        System.out.println("autoritater");
        for (String authority : authorities) {
            System.out.println(authority);
//            steeringGroupMembers += (String)nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + (String)nodeService.getProperty(person, ContentModel.PROP_LASTNAME) + "\n";



        }


        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();
        JSONObject json = new JSONObject();

//        try {
//            json.put("primaryParent_nodeRef", nodeService.getPrimaryParent(nodeRef).getParentRef());
//            json.put("primaryParent_name", nodeService.getProperty(nodeService.getPrimaryParent(nodeRef).getParentRef(), ContentModel.PROP_NAME));
//            json.put("currentNodeRef_nodeRef", nodeRef.toString());
//            json.put("currentNodeRef_name", nodeService.getProperty(nodeRef, ContentModel.PROP_NAME));
//            result.add(json);
//
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }


        return null;
    }
}
