package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.repository.NodeRef;

import java.io.IOException;

public class RemoveSiteLinkTest extends OpenDeskWebScriptTest {

    private String siteShortName = SITE_ONE;
    private String targetSiteShortName = SITE_TWO;

    public RemoveSiteLinkTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        sites.put(targetSiteShortName, null);
    }

    @Override
    protected void setUpTest() {
        addLink(siteShortName, targetSiteShortName);
    }

    public void testRemoveSiteLink() throws IOException {
        String uri = "/site/" + siteShortName +"/siteLink/" + targetSiteShortName;
        executeDelete(uri, ADMIN);
        AuthenticationUtil.runAs(() -> {
            NodeRef link = siteBean.getLink(siteShortName, targetSiteShortName);
            assertNull(link);
            return null;
        }, ADMIN);
    }
}
