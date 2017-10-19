package dk.opendesk.repo.bootstrap;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.springframework.context.ApplicationEvent;
import org.springframework.extensions.surf.util.AbstractLifecycleBean;

import java.util.ArrayList;
import java.util.List;

import static dk.opendesk.repo.model.OpenDeskModel.ORGANIZATIONAL_CENTERS;
import static dk.opendesk.repo.model.OpenDeskModel.PROJECT_OWNERS;

public class Bootstrap extends AbstractLifecycleBean {

    private AuthorityService authorityService;

    public AuthorityService getAuthorityService() {
        return authorityService;
    }

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    protected void onBootstrap(ApplicationEvent applicationEvent) {

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        List<String> requiredGroups = new ArrayList<>();
        requiredGroups.add(PROJECT_OWNERS);
        requiredGroups.add(ORGANIZATIONAL_CENTERS);

        // Create required groups if they do not exist
        for (String group : requiredGroups) {
            if(!authorityService.authorityExists("GROUP_" + group))
            {
                authorityService.createAuthority(AuthorityType.GROUP, group);
            }
        }
    }

    @Override
    protected void onShutdown(ApplicationEvent applicationEvent) {

    }
}