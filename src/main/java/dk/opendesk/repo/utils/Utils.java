package dk.opendesk.repo.utils;

import java.io.Serializable;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.*;
import java.util.stream.Collectors;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.site.SiteServiceException;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.i18n.MessageLookup;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AccessPermission;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.I18NUtil;



/**
 * Created by syastrov on 8/26/14.
 */
public class Utils {

    private static final String ROLE_NAME_MESSAGE_PREFIX = "role.";

    /**
     * Alfresco's (or Java's) query string parsing doesn't handle UTF-8
     * encoded values. We parse the query string ourselves here.
     * @param url
     * @return
     */
    public static Map<String, String> parseParameters(String url) {
        // Do our own parsing to get the query string since java.net.URI can't
        // handle some URIs
        int queryStringStart = url.indexOf('?');
        String queryString = "";
        if (queryStringStart != -1) {
            queryString = url.substring(queryStringStart+1);
        }
        Map<String, String> parameters = URLEncodedUtils
                .parse(queryString, Charset.forName("UTF-8"))
                .stream()
                .collect(
                        Collectors.groupingBy(
                                NameValuePair::getName,
                                Collectors.collectingAndThen(Collectors.toList(), Utils::paramValuesToString)));
        return parameters;
    }

    private static String paramValuesToString(List<NameValuePair> paramValues) {
        if (paramValues.size() == 1) {
            return paramValues.get(0).getValue();
        }
        List<String> values = paramValues.stream().map(NameValuePair::getValue).collect(Collectors.toList());
        return "[" + StringUtils.join(values, ",") + "]";
    }

    public static String getJSONObject(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getString(parameter).length() == 0)
        {
            return "";
        }
        return json.getString(parameter);
    }

    public static NodeRef getNodeRef(JSONObject json) throws JSONException {
        String storeType = getJSONObject(json, "PARAM_STORE_TYPE");
        String storeId = getJSONObject(json, "PARAM_STORE_ID");
        String nodeId = getJSONObject(json, "PARAM_NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            return new NodeRef(storeType, storeId, nodeId);
        }
        return null;
    }

    public static JSONArray getJSONSuccess () {
        return getJSONReturnPair("status", "success");
    }

    public static JSONArray getJSONError (Exception e) {
        Map<String, Serializable> map = new HashMap<>();
        map.put("error", e.toString());
        return getJSONReturnArray(map);
    }

    public static JSONArray getJSONReturnPair (String key, String value) {
        Map<String, Serializable> map = new HashMap<>();
        map.put(key, value);
        return getJSONReturnArray(map);
    }

    public static JSONArray getJSONReturnArray(Map<String, Serializable> map) {
        JSONObject return_json = new JSONObject();
        JSONArray result = new JSONArray();
        try {
            for (Map.Entry<String, Serializable> pair : map.entrySet())
                return_json.put(pair.getKey(), pair.getValue().toString());
            result.add(return_json);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public static void writeJSONArray (Writer writer, JSONArray result) {
        try {
            result.writeJSONString(writer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getGroupUserRole (AuthorityService authorityService, Set<AccessPermission> permissions, String group) {

        for (AccessPermission a : permissions) {
            if(a.getAuthority().equals(PermissionService.ALL_AUTHORITIES))
                continue;

            Set<String> authorities = authorityService.getContainedAuthorities(AuthorityType.GROUP, a.getAuthority(), true);
            if (authorities.contains(group)) {
                return a.getPermission();
            }
        }
        return null;
    }

    public static String getPDGroupName (String siteShortName, String groupName)
    {
        String siteGroup = "GROUP_site_" + siteShortName;
        if("".equals(groupName))
            return siteGroup;
        else
            return siteGroup + "_" + groupName;
    }

    // NOTICE: Sites created this way does not work in Share as they lack dashboards.
    public static NodeRef createSite(NodeService nodeService, SiteService siteService, String displayName,
                              String description, SiteVisibility siteVisibility) {

        String shortName = displayName.replaceAll(" ", "-");
        String shortNameWithVersion = shortName;
        SiteInfo site = null;

        // Iterate through possible short names for the new site until a vacant is found
        int i = 1;
        do {
            try {
                // Create site
                site = siteService.createSite("site-dashboard", shortNameWithVersion, displayName, description,
                        siteVisibility);

                // Create documentLibary
                String defaultFolder = "documentLibrary";
                Map<QName, Serializable> documentLibaryProps = new HashMap<>();
                documentLibaryProps.put(ContentModel.PROP_NAME, defaultFolder);

                nodeService.createNode(site.getNodeRef(), ContentModel.ASSOC_CONTAINS,
                        QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, "documentLibrary"),
                        ContentModel.TYPE_FOLDER, documentLibaryProps);
            }
            catch(SiteServiceException e) {
                if(e.getMsgId().equals("site_service.unable_to_create"))
                    shortNameWithVersion = shortName + "-" + ++i;
            }
        }
        while(site == null);

        return site.getNodeRef();
    }
}