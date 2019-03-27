// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.webscripts.notification;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.OpenDeskWebScriptTest;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class NotificationsTest extends OpenDeskWebScriptTest {

    private static final String UNSEEN = "unseen";
    private static final String UNREAD = "unread";
    private static final String NOTIFICATIONS = "notifications";

    public NotificationsTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        // SITES
        sites.put(SITE_TWO, null);
        sites.put(SITE_THREE, null);
    }

    public void testGetNoUnseenNotifications() throws IOException, JSONException {
        JSONObject returnJSON = executeGetNotifications();
        assertUnseen(returnJSON, 0);
    }

    public void testGetNoUnreadNotifications() throws IOException, JSONException {
        JSONObject returnJSON = executeGetNotifications();
        assertUnread(returnJSON, 0);
    }

    public void testGetThreeNotifications() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_TWO, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_THREE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetNotifications();
        assertGetAll(returnJSON, 3);
    }

    // TODO: remember to enable uploading of file when notifications are working again

    public void testGetTwoNotifications() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            // uploadFile(sites.get(SITE_ONE), FILE_TEST_UPLOAD);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetNotifications();
        assertGetAll(returnJSON, 1);
    }

    public void testDeleteNotification() throws JSONException, IOException {
        String latestNotificationId = addSiteMember();
        String uri = "/notification/" + latestNotificationId;
        executeDelete(uri);
        JSONObject returnJSON = executeGetNotifications();
        assertGetAll(returnJSON, 0);
    }

    public void testSetReadNotification() throws IOException, JSONException {
        String latestNotificationId = addSiteMember();
        String uri = "/notification/" + latestNotificationId + "/read";
        executePut(uri);
        JSONObject returnJSON = executeGetNotifications();
        assertUnread(returnJSON, 0);
    }

    public void testSetSeenNotification() throws IOException, JSONException {
        String latestNotificationId = addSiteMember();
        String uri = "/notification/" + latestNotificationId + "/seen";
        executePut(uri);
        JSONObject returnJSON = executeGetNotifications();
        assertUnseen(returnJSON, 0);
    }

    public void testSetAllNotificationsSeen() throws IOException, JSONException {
        String uri = "/notifications/seen";
        executePut(uri);
        JSONObject returnJSON = executeGetNotifications();
        assertUnseen(returnJSON, 0);
    }

    private void assertGetAll(JSONObject notificationsJSON, int expectedCount) throws JSONException {
        assertEquals(expectedCount, notificationsJSON.getJSONArray(NOTIFICATIONS).length());
    }

    private void assertUnseen(JSONObject notificationsJSON, int expectedCount) throws JSONException {
        assertTrue(notificationsJSON.has(UNSEEN));
        assertEquals(expectedCount, notificationsJSON.getInt(UNSEEN));
    }

    private void assertUnread(JSONObject notificationsJSON, int expectedCount) throws JSONException {
        assertTrue(notificationsJSON.has(UNREAD));
        assertEquals(expectedCount, notificationsJSON.getInt(UNREAD));
    }

    private JSONObject executeGetNotifications() throws IOException, JSONException {
        String uri = "/notifications";
        return executeGetObject(uri);
    }

    private String addSiteMember() throws IOException, JSONException {
        //Adds one notification
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetNotifications();
        assertUnread(returnJSON, 1);
        return getLatestNotificationId(returnJSON);
    }

    private String getLatestNotificationId(JSONObject notificationsJSON) throws JSONException {
        JSONArray notifications = notificationsJSON.getJSONArray(NOTIFICATIONS);
        JSONObject latestNotification = notifications.getJSONObject(0);
        return latestNotification.getString("notificationId");
    }
}
