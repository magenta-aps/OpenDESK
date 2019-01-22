// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.bootstrap;

import dk.opendesk.repo.beans.EditorBean;
import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.springframework.context.ApplicationEvent;
import org.springframework.extensions.surf.util.AbstractLifecycleBean;

import java.util.ArrayList;
import java.util.List;

public class Bootstrap extends AbstractLifecycleBean {

    private EditorBean editorBean;

    private AuthorityService authorityService;

    public void setEditorBean(EditorBean editorBean) {
        this.editorBean = editorBean;
    }

    public AuthorityService getAuthorityService() {
        return authorityService;
    }

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    protected void onBootstrap(ApplicationEvent applicationEvent) {
        AuthenticationUtil.runAs(() -> {
            List<Group> groups = new ArrayList<>();
            Group centerForTest = new Group(OpenDeskModel.CENTER_TEST, "Center for Test");
            centerForTest.addMembers("admin");
            groups.add(centerForTest);

            Group projectOwners = new Group(OpenDeskModel.PROJECT_OWNERS, "Projektejere");
            projectOwners.addMembers("admin");
            groups.add(projectOwners);

            Group organizationalCenters = new Group(OpenDeskModel.ORGANIZATIONAL_CENTERS, "Org. enheder");
            organizationalCenters.addMembers("GROUP_" + OpenDeskModel.CENTER_TEST);
            groups.add(organizationalCenters);

            // Create required groups if they do not exist
            for (Group group : groups) {
                String displayName = group.getDisplayName();
                String shortName = group.getShortName();
                if (!authorityService.authorityExists("GROUP_" + shortName)) {
                    String authority = authorityService.createAuthority(AuthorityType.GROUP, shortName);
                    authorityService.setAuthorityDisplayName(authority, displayName);
                    List<String> members = group.getMembers();
                    for (String member : members) {
                        authorityService.addAuthority(authority, member);
                    }
                }
            }

            // Load Editors
            editorBean.loadEditors();
            return true;
        }, AuthenticationUtil.getSystemUserName());
    }

    @Override
    protected void onShutdown(ApplicationEvent applicationEvent) {

    }
}
