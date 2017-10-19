'use strict';

angular.module('openDeskApp.site').factory('siteService', SiteService);

function SiteService($q, $http, $window, alfrescoNodeUtils, sessionService, notificationsService, authService, systemSettingsService) {

    var restBaseUrl = '/alfresco/s/api/';

    var currentUser = authService.getUserInfo().user;
    var site = {};
    var groups = {};
    var userManagedProjects = [];
    var currentPermissions;

    var editRole = 'Collaborator';
    var managerRole = 'Manager';
    var outsiderRole = 'Outsider';
    var ownerRole = "Owner";
    var adminPermissions = {};
    adminPermissions.isManager = true;
    adminPermissions.isMember = true;
    adminPermissions.canEdit = true;
    adminPermissions.userRole = managerRole;

    return {

        getSite: function () {
            return site;
        },

        getSiteMembers: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            });
        },

        getAllOwners: function () {

            return $http.post("/alfresco/service/groups", {
                PARAM_METHOD: "getGroupMembers",
                PARAM_GROUP_NAME: 'OPENDESK_ProjectOwners'
            }).then(function (response) {
                    return response.data;
                },
                function (error) {
                    console.log("Error retrieving list of all managers.");
                    console.log(error);
                });
        },

        getTemplateNames: function () {

            return systemSettingsService.getTemplates().then(function (response) {
                return response;
            });
        },

        getAllOrganizationalCenters: function () {
            return $http.get('/api/groups/OPENDESK_OrganizationalCenters/children?maxItems=500')
                .then(function (response) {
                    if (response.status && response.status !== 200) {
                        return $q.reject(response);
                    }
                    return response.data || response;
                }, function (error) {
                    console.log("Error retrieving list of all organizational centers.");
                    console.log(error);
                });
        },

        getSites: function () {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getAll"
            }).then(
                function (response) {
                    return response.data;
                },
                function (error) {
                    console.log("Error retrieving list of all sites.");
                    console.log(error);
                }
            );
        },
        getSitesPerUser: function () {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getSitesPerUser"
            }).then(
                function (response) {
                    return response.data;
                },
                function (err) {
                    //console.log(err);
                }
            );
        },
        getSitesByQuery: function (query) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getSitesPerUser",
                PARAM_USERNAME: "query"
            }).then(function (response) {
                return response.data;
            });
        },
        createSite: function (siteName, siteDescription, siteVisibility) {
            return $http.post('/alfresco/service/sites', {
                PARAM_METHOD: "createSite",
                PARAM_SITE_DISPLAY_NAME: siteName,
                PARAM_DESCRIPTION: siteDescription,
                PARAM_VISIBILITY: siteVisibility
            }).then(
                function (response) {
                    return response.data;
                },
                function (error) {
                    if (error.data.status.code == "400" && error.data.message == "error.duplicateShortName")
                        return null;
                }
            );
        },
        updateSite: function (shortName, newName, description, visibility) {
            return $http.put('/api/sites/' + shortName, {
                shortName: shortName,
                sitePreset: "default",
                title: newName,
                description: (description && description !== '') ? description : '',
                visibility: visibility
            }).then(function (response) {
                var isInherited = response.data.isPublic;
                getNode(shortName, "documentLibrary", "").then(function (response) {
                    var nodeId = response.parent.nodeRef.split("/")[3];
                    var data = {
                        "isInherited": isInherited,
                        "permissions": []
                    };
                    return $http.post('/alfresco/s/slingshot/doclib/permissions/workspace/SpacesStore/' + nodeId, data)
                        .then(function (response) {
                            return response;
                        });
                });
            });
        },
        loadSiteData: function (shortName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getSite",
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function (response) {
                site = response.data[0];
                return site;
            });
        },

        createPDSite: function (siteName, description, sbsys, center_id, owner, manager, visibility, template) {
            return $http.post('/alfresco/service/projectdepartment', {
                PARAM_NAME: siteName,
                PARAM_DESCRIPTION: description,
                PARAM_SBSYS: sbsys,
                PARAM_OWNER: owner,
                PARAM_MANAGER: manager,
                PARAM_VISIBILITY: visibility,
                PARAM_CENTERID: center_id,
                PARAM_METHOD: "createPDSITE",
                PARAM_TEMPLATE: template
            }).then(function (response) {
                return response;
            });
        },

        updatePDSite: function (shortName, siteName, description, sbsys, center_id, owner, manager, visibility, state) {
            return $http.post('/alfresco/service/projectdepartment', {
                PARAM_NAME: siteName,
                PARAM_SITE_SHORT_NAME: shortName,
                PARAM_DESCRIPTION: description,
                PARAM_SBSYS: sbsys,
                PARAM_OWNER: owner,
                PARAM_MANAGER: manager,
                PARAM_CENTERID: center_id,
                PARAM_VISIBILITY: visibility,
                PARAM_STATE: state,
                PARAM_METHOD: "updatePDSITE"
            }).then(function (response) {
                return response;
            });
        },

        addMemberToSite: function (siteShortName, user, group) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "addUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function (response) {
                return response.data;
            });

        },
        getMemberFromSite: function (siteName, member) {
            return $http.get('/api/sites/' + siteName + '/memberships/' + member).then(function (response) {
                return response.data;
            });
        },
        removeMemberFromSite: function (siteShortName, user, group) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "removeUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function (response) {
                console.log(response);
                return response.data;
            });

        },
        updateRoleOnSiteMember: function (siteName, member, newRole) {

            return $http.put('/api/sites/' + siteName + '/memberships', {
                role: newRole,
                person: {
                    userName: member
                }
            }).then(function (response) {
                return response.data;
            });
        },
        deleteSite: function (siteName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "deleteSite",
                PARAM_SITE_SHORT_NAME: siteName
            }).then(function (response) {
                return response.data;
            });
        },
        createFolder: function (type, props) {
            return $http.post('/api/type/' + type + '/formprocessor', props).then(function (response) {
                var nodeRef = response.data.persistedObject;
                return nodeRef;
            });
        },
        deleteFolder: function (nodeRef) {
            var url = '/slingshot/doclib/action/folder/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri;
            return $http.delete(url).then(function (result) {
                //console.log(result);
                return result.data;
            });
        },
        deleteFile: function (nodeRef) {
            var url = '/slingshot/doclib/action/file/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri;
            return $http.delete(url).then(function (result) {
                return result.data;
            });
        },
        uploadFiles: function (file, destination, extras) {

            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "returnFileName",
                PARAM_FILENAME: file.name,
                PARAM_DESTINATION: destination
            }).then(function (response) {

                var formData = new FormData();
                formData.append("filedata", file);
                formData.append("filename", response.data[0].fileName);
                formData.append("destination", destination ? destination : null);


                return $http.post("/api/upload", formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function (response) {
                    return response;
                });
            });


        },
        uploadNewVersion: function (file, destination, existingNodeRef) {
            var formData = new FormData();
            formData.append("filedata", file);
            formData.append("updatenoderef", existingNodeRef);
            formData.append("majorversion", false);
            formData.append("filename", file.name);
            formData.append("destination", destination ? destination : null);

            return $http.post("/api/upload", formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function (response) {
                return response;
            });
        },
        updateNode: function (nodeRef, props) {
            return $http.post('/api/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri + '/formprocessor', props).then(function (response) {
                return response.data;
            });
        },
        addUser: function (siteShortName, user, group) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "addUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function (response) {

                //console.log(response.data);
                return response.data;
            });
        },
        removeUser: function (siteShortName, user, group) {
            console.log("remove user" + user);
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "removeUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function (response) {
                console.log(response);
                return response.data;
            });
        },
        addRole: function (siteShortName, user, role) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "addPermission",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_ROLE: role
            }).then(function (response) {
                //console.log(response.data)
                return response.data;
            });
        },
        removeRole: function (siteShortName, user, role) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "removePermission",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_ROLE: role
            }).then(function (response) {
                //console.log(response.data)
                return response.data;
            });
        },
        createProjectLink: function (destination) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "addLink",
                PARAM_SOURCE: site.shortName,
                PARAM_DESTINATION: destination
            }).then(function (response) {
                //console.log(response.data)
                return response.data;
            });
        },
        deleteLink: function (source, destination) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "deleteLink",
                PARAM_SOURCE: source,
                PARAM_DESTINATION: destination
            }).then(function (response) {
                console.log(response.data);
                return response.data;
            });
        },
        createMembersPDF: function (shortName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "createMembersPDF",
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function (response) {
                return response.data;
            });
        },
        getSiteGroups: function (siteType) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getSiteGroups",
                PARAM_SITE_TYPE: siteType
            }).then(function (response) {
                return response.data;
            });
        },
        makeSiteATemplate: function (shortName, templateName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "makeSiteATemplate",
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function (response) {
                return response.data;
            });
        },
        createTemplate: function (shortName, description) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "createTemplate",
                PARAM_SITE_SHORT_NAME: shortName,
                PARAM_DESCRIPTION: description
            }).then(function (response) {
                return response.data;
            });
        },

        createExternalUser: function (siteShortName, firstName, lastName, email, groupName) {
            return $http.post('/alfresco/service/users', {
                PARAM_METHOD: "createExternalUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_FIRSTNAME: firstName,
                PARAM_LASTNAME: lastName,
                PARAM_EMAIL: email,
                PARAM_GROUP_NAME: groupName
            }).then(function (response) {
                return response;
            });
        },

        checkIfEmailExists: function (email) {
            return $http.post('/alfresco/service/users', {
                PARAM_METHOD: "checkEmailIfExists",
                PARAM_EMAIL: email
            }).then(function (response) {
                return response;
            });
        },

        getNode: getNode,

        getSiteUserPermissions: function (siteShortName) {

            if (sessionService.isAdmin()) {
                currentPermissions = adminPermissions;
                return $q.resolve(adminPermissions);
            }

            var permissions = {};
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getCurrentUserSiteRole",
                PARAM_SITE_SHORT_NAME: siteShortName
            }).then(
                function (response) {
                    var userRole;
                    if (response.data[0].role === undefined)
                        userRole = outsiderRole;
                    else
                        userRole = response.data[0].role;

                    permissions.userRole = userRole;
                    permissions.isManager = userRole == managerRole;
                    switch (userRole) {
                        case editRole:
                        case ownerRole:
                        case managerRole:
                            permissions.canEdit = true;
                            break;
                        default:
                            permissions.canEdit = false;
                            break;
                    }
                    permissions.isMember = userRole != outsiderRole;
                    currentPermissions = permissions;
                    return permissions;
                }
            );
        },

        getPermissions: function () {
            return currentPermissions;
        },


        setUserManagedProjects: function () {
            this.getSitesPerUser().then(function (response) {
                var projects = [];
                for (var i in response) {
                    if (response[i].shortName !== site.shortName && response[i].current_user_role == managerRole)
                        projects.push(response[i]);
                }
                userManagedProjects = projects;
            });
        },

        getUserManagedProjects: function () {
            return userManagedProjects;
        },

        //Groups

        getGroupsAndMembers: function () {
            return $http.post("/alfresco/service/groups", {
                PARAM_METHOD: "getGroupsAndMembers",
                PARAM_SITE_SHORT_NAME: site.shortName
            }).then(function (response) {
                groups.list = response.data;
                return response.data;
            });
        },

        // Notifications

        createDocumentNotification: function (nodeRef, fileName) {

            var id = alfrescoNodeUtils.processNodeRef(nodeRef).id;
            var subject = "Nyt dokument i " + site.title;
            var message = "Et nyt dokument \"" + fileName + "\" er blevet uploadet af " + currentUser.displayName;
            var link = "#!/dokument/" + id;

            // Iterating list of items.
            angular.forEach(groups.list, function (group) {
                angular.forEach(group[1], function (member) {
                    if (member.userName != currentUser.userName) {
                        var preferenceFilter = "dk.magenta.sites.receiveNotifications";
                        var receiveNotifications = "true";

                        if (member.preferences[preferenceFilter] !== null)
                            receiveNotifications = member.preferences[preferenceFilter];

                        if (receiveNotifications !== null && receiveNotifications == "true") {
                            createNotification(member.userName, subject, message, link, 'new-doc', site.shortName);
                        }
                    }
                });
            });
        },

        createReviewNotification: function (documentNodeRef, receiver, message) {
            var sender = currentUser.userName;
            var s = documentNodeRef.split("/");
            var ref = (s[3]);
            var link = "#!/dokument/" + ref + "?dtype=wf" + "&from=" + sender;

            var sub = "Review forespørgsel";
            createNotification(receiver, sub, message, link, 'review-request', site.shortName);
        }
    };

    function getNode(siteName, container, path) {
        return $http.get('/slingshot/doclib/treenode/site/' + siteName + '/' + container + '/' + path).then(function (response) {
            return response.data;
        });
    }

    function createNotification(receiver, subject, message, link, wtype, project) {
        notificationsService.addNotice(receiver, subject, message, link, wtype, project);
    }

}