package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
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

    private SiteService siteService;
    private NodeService nodeService;
    private AuthorityService authorityService;
    private PersonService personService;
    private PreferenceService preferenceService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
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
            String siteShortName = Utils.getJSONObject(json, "PARAM_SITE_SHORT_NAME");
            String groupName = Utils.getJSONObject(json, "PARAM_GROUP_NAME");

            if(method != null) {
                switch (method) {

                    case "getGroupsAndMembers":
                        result = this.getGroupsAndMembers(siteShortName);
                        break;

                    case "getGroupMembers":
                        result = getGroupMembers("GROUP_" + groupName);
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

    private JSONArray getGroupsAndMembers(String siteShortName)
            throws JSONException {

        NodeRef siteNodeRef = siteService.getSite(siteShortName).getNodeRef();
        String siteType = OpenDeskModel.project;
        if (nodeService.hasAspect(siteNodeRef, OpenDeskModel.ASPECT_PD))
            siteType = OpenDeskModel.pd_project;


        JSONArray result = new JSONArray();
        for (Object groupObject : Utils.siteGroups.get(siteType)) {

            JSONArray json = new JSONArray();
            JSONObject groupJSON = (JSONObject) groupObject;
            json.add(groupJSON);

            String groupAuthorityName = Utils.getAuthorityName(siteShortName, groupJSON.getString("shortName"));
            JSONArray members = getGroupMembers(groupAuthorityName);
            json.add(members);
            result.add(json);
        }

        return result;
    }

    private JSONArray getGroupMembers(String group) throws JSONException {

        Set<String> users = authorityService.getContainedAuthorities(AuthorityType.USER, group, true);

        JSONArray members = new JSONArray();
        for (String userName : users) {
            NodeRef user = personService.getPerson(userName);
            JSONObject json = Utils.convertUserToJSON(nodeService, preferenceService, user);
            members.add(json);
        }

        return members;
    }
}
