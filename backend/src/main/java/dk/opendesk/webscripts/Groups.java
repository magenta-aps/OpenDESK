package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.util.Set;

public class Groups extends AbstractWebScript {

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
            String groupType = Utils.getJSONObject(json, "PARAM_GROUP_TYPE");
            AuthorityType memberType;

            switch (groupType) {
                case "USER":
                    memberType = AuthorityType.USER;
                    break;
                case "GROUP":
                    memberType = AuthorityType.GROUP;
                    break;
                default:
                    memberType = null; // Returns both users and groups
                    break;
            }

            if(method != null) {
                switch (method) {

                    case "getGroupsAndMembers":
                        result = this.getGroupsAndMembers(siteShortName, memberType);
                        break;

                    case "getGroupMembers":
                        result = getGroupMembers("GROUP_" + groupName, memberType);
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

    /**
     * Gets all groups of a site and their members.
     * (method = getGroupsAndMembers)
     * @param siteShortName short name of a site.
     * @return a JSONArray containing JSONObjects for each group and each of their members.
     */
    private JSONArray getGroupsAndMembers(String siteShortName, AuthorityType memberType)
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
            JSONArray members = getGroupMembers(groupAuthorityName, memberType);
            json.add(members);
            result.add(json);
        }

        return result;
    }

    /**
     * Gets all members of a group.
     * (method = getGroupMembers)
     * @param group name of a group.
     * @return a JSONArray containing JSONObjects for each group member.
     */
    private JSONArray getGroupMembers(String group, AuthorityType memberType) throws JSONException {

        Set<String> members = authorityService.getContainedAuthorities(memberType, group, false);

        JSONArray result = new JSONArray();
        for (String shortName : members) {
            JSONObject json;
            if(shortName.startsWith("GROUP_")) {
                json = Utils.convertGroupToJSON(authorityService, shortName);
            }
            else {
                NodeRef user = personService.getPerson(shortName);
                json = Utils.convertUserToJSON(nodeService, user);
            }
            result.add(json);
        }

        return result;
    }
}
