// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.beans;

import dk.opendesk.repo.utils.Pager;
import dk.opendesk.repo.utils.SiteGroup;
import org.alfresco.query.PagingRequest;
import org.alfresco.query.PagingResults;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Pair;

import java.util.*;

import static dk.opendesk.repo.model.OpenDeskModel.ORGANIZATIONAL_CENTERS;
import static dk.opendesk.repo.model.OpenDeskModel.PROJECT_OWNERS;

public class AuthorityBean {

    private PersonBean personBean;
    private AuthorityService authorityService;

    public void setPersonBean(PersonBean personBean) {
        this.personBean = personBean;
    }

    public void setAuthorityService (AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    public Pair<JSONArray, Integer> getAuthorities(String groupName, int maxItems, int skipCount) throws JSONException {
        Pair<List<String>, Integer> authorities = getAuthorityList(groupName, maxItems, skipCount);
        return new Pair<>(getAuthorityToJSON(authorities.getFirst()), authorities.getSecond());

    }

    public Pair<List<String>, Integer> getAuthorityList(String groupName, int maxItems, int skipCount) {
        return Pager.pageResult(
                authorityService.getContainedAuthorities(null, groupName, true),
                maxItems,
                skipCount);
    }

    private JSONArray getAuthorityToJSON(List<String> authorities) throws JSONException {
        JSONArray result = new JSONArray();
        for (String authorityName : authorities) {
            JSONObject json;
            if(authorityName.startsWith("GROUP_")) {
                json = getGroupInfo(authorityName);
            }
            else {
                json = personBean.getPersonInfo(authorityName);
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
        String avatar = "assets/img/avatars/blank-profile-picture.png";
        json.put("avatar", avatar);
        return json;
    }

    public JSONObject getOpenDeskGroup(String groupName) throws JSONException {
        Map<String, String> odGroups = getOpenDeskGroupObjects();
        String type = odGroups.get(groupName);
        JSONObject json = new JSONObject();
        json.put("shortName", groupName);
        json.put("type", type);
        JSONArray authorities = getAuthorities("GROUP_" + groupName, Integer.MAX_VALUE, 0).getFirst();
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

    public Pair<List<String>, Integer> getUserList(String groupName, int maxItems, int skipCount) {
        return Pager.pageResult(
                authorityService.getContainedAuthorities(AuthorityType.USER, groupName, false),
                maxItems,
                skipCount);
    }

    public Pair<JSONArray, Integer> getUsers(String groupName, int maxItems, int skipCount) throws JSONException {
        Pair<List<String>, Integer> userNamesAndTotalCount = getUserList(groupName, maxItems, skipCount);
        return new Pair<>(getAuthorityToJSON(userNamesAndTotalCount.getFirst()), userNamesAndTotalCount.getSecond());

    }

    public JSONArray findAuthorities(String filter) throws JSONException {
        return findAuthorities(filter, true, null);
    }

    public JSONArray findAuthorities(String filter, List<String> ignoreList) throws JSONException {
        return findAuthorities(filter, true, ignoreList);
    }

    private JSONArray findAuthorities(String filter, boolean includeGroups, List<String> ignoreList) throws JSONException {
        JSONArray result = personBean.searchPersons(filter, ignoreList);
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

    /**
     * E.g. if the user is a member of both SiteManager and SiteCollaborator then SiteManager will be returned
     */
    public SiteGroup getTopAuthorityForUser(String userName, String siteShortName) {
        Set<String> authorities = authorityService.getAuthoritiesForUser(userName);

        return authorities.stream()
                .filter(name -> name.contains(siteShortName) && !name.endsWith(siteShortName))
                .map(name -> {
                    String[] s = name.split("_");
                    return SiteGroup.valueOf(s[s.length - 1]);
                })
                .reduce(SiteGroup.SiteConsumer, (siteGroup1, siteGroup2) ->
                    siteGroup1.ordinal() < siteGroup2.ordinal() ? siteGroup2 : siteGroup1
                );
    }
}
