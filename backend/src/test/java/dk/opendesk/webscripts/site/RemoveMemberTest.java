package dk.opendesk.webscripts.site;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.json.JSONException;

import java.io.IOException;

public class RemoveMemberTest extends OpenDeskWebScriptTest {

    private String siteShortName = SITE_ONE;
    private String userName = USER_ONE;
    private String groupName = OpenDeskModel.SITE_CONSUMER;

    public RemoveMemberTest() {
        super();
    }

    @Override
    protected void setUpTest() {
        addMemberToSite(siteShortName, userName, groupName);
    }

    public void testRemoveMember() throws IOException {
        String uri = "/site/" + siteShortName +"/group/" + groupName + "/member/" + userName;
        executeDelete(uri, ADMIN);
        AuthenticationUtil.runAs(() -> {
            boolean isMember = siteService.isMember(siteShortName, userName);
            assertFalse(isMember);
            return null;
        }, ADMIN);
    }
}
