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
    private static final String NOTIFICATIONS_URL = "/" + NOTIFICATIONS;

    public NotificationsTest() {
        super();
    }

    @Override
    protected void AddUsersAndSites() {
        // Users
        users.add(USER_TWO);
        users.add(USER_THREE);

        // SITES
        sites.put(SITE_TWO, null);
        sites.put(SITE_THREE, null);
        sites.put(SITE_FOUR, null);
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

    public void testGetTwoNotifications() throws IOException, JSONException {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            uploadFile(sites.get(SITE_ONE), FILE_TEST_UPLOAD, FILE_TEST_UPLOAD);
            return null;
        }, ADMIN);
        JSONObject returnJSON = executeGetNotifications();
        assertGetAll(returnJSON, 2);
    }

    public void testTruncateNumberOfNotificationsToLimitValue() throws Exception {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_TWO, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_THREE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_FOUR, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            return null;
        }, ADMIN);
        JSONObject response = executeGetNotifications();
        assertGetAll(response, 3);
    }

    public void testVerifyThatOldNotificationsAreTruncated() throws Exception {
        addUsersToSite();

        // Truncation limit is set to three in alfresco-global.properties

        // Upload 3 documents to site as user1
        AuthenticationUtil.runAs(() -> {
            uploadFile(sites.get(SITE_ONE), "file1.txt", "file1.txt");
            uploadFile(sites.get(SITE_ONE), "file1.txt", "file2.txt");
            uploadFile(sites.get(SITE_ONE), "file1.txt", "file3.txt");
            return null;
        }, USER_ONE);

        JSONObject notifications_user2 = executeGetObject(NOTIFICATIONS_URL, USER_TWO);

        // user2 should have exactly three notifications
        assertGetAll(notifications_user2, 3);

        // Get the notification ids of the last two notifications for later comparison
        String user2NotificationId1 = getNotificationId(notifications_user2, 1);
        String user2NotificationId2 = getNotificationId(notifications_user2, 2);

        // Upload another document
        AuthenticationUtil.runAs(() -> {
            uploadFile(sites.get(SITE_ONE), "file1.txt", "file4.txt");
            return null;
        }, USER_ONE);

        // Get notifications
        notifications_user2 = executeGetObject(NOTIFICATIONS_URL, USER_TWO);

        // user2 should have exactly three notifications and the old ones should move down the list (2 -> 1 and 3 -> 2)
        assertGetAll(notifications_user2, 3);
        assertEquals(user2NotificationId1, getNotificationId(notifications_user2, 0));
        assertEquals(user2NotificationId2, getNotificationId(notifications_user2, 1));
        assertFalse(user2NotificationId1.equals(getNotificationId(notifications_user2, 2)));
        assertFalse(user2NotificationId2.equals(getNotificationId(notifications_user2, 2)));

    }

    // This test was added due to Redmine issue #28052
    public void testNotificationByUserOneIsAddedToOtherUsers() throws Exception {
        addUsersToSite();

        JSONObject notifications_user1 = executeGetObject(NOTIFICATIONS_URL, USER_ONE);
        JSONObject notifications_user2 = executeGetObject(NOTIFICATIONS_URL, USER_TWO);
        JSONObject notifications_user3 = executeGetObject(NOTIFICATIONS_URL, USER_THREE);

        // User should be notified that they have been added to a site
        assertGetAll(notifications_user1, 1);
        assertGetAll(notifications_user2, 1);
        assertGetAll(notifications_user3, 1);

        // Upload document to site as user1
        AuthenticationUtil.runAs(() -> {
            uploadFile(sites.get(SITE_ONE), "file1.txt", "file1.txt");
            return null;
        }, USER_ONE);

        // Get notifications again
        notifications_user1 = executeGetObject(NOTIFICATIONS_URL, USER_ONE);
        notifications_user2 = executeGetObject(NOTIFICATIONS_URL, USER_TWO);
        notifications_user3 = executeGetObject(NOTIFICATIONS_URL, USER_THREE);

        // Verify that the other users got a notification - but not user1
        assertGetAll(notifications_user1, 1);
        assertGetAll(notifications_user2, 2);
        assertGetAll(notifications_user3, 2);
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

    private void addUsersToSite() {
        AuthenticationUtil.runAs(() -> {
            addMemberToSite(SITE_ONE, USER_ONE, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_ONE, USER_TWO, OpenDeskModel.SITE_COLLABORATOR);
            addMemberToSite(SITE_ONE, USER_THREE, OpenDeskModel.SITE_COLLABORATOR);
            return null;
        }, ADMIN);
    }

    private String getNotificationId(JSONObject notification, int index) throws Exception {
        return notification.getJSONArray(NOTIFICATIONS).getJSONObject(index).getString("notificationId");
    }
}

// TODO: write tests that verifies that the content itself in the notifications messages is correct
