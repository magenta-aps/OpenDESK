package dk.opendesk.webscripts.site;

import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.service.cmr.site.SiteInfo;

import java.io.IOException;

public class DeleteSiteTest extends OpenDeskWebScriptTest {

    public DeleteSiteTest() {
        super();
    }

    public void testDeleteSite()  throws IOException {
        String siteShortName = SITE_ONE;
        String uri = "/site/" + siteShortName;
        executeDelete(uri, ADMIN);
        SiteInfo siteInfo = siteService.getSite(siteShortName);
        assertNull(siteInfo);
    }
}
