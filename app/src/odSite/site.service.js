'use strict';

angular.module('openDeskApp.site').factory('siteService', SiteService);

function SiteService($q, $http, $window, alfrescoNodeUtils, sessionService, notificationsService, authService, avatarUtilsService, systemSettingsService) {

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
    var adminPermissions = {
        isManager: true,
        isMember: true,
        canEdit: true,
        userRole: managerRole
    };

    var service = {
        addMemberToSite: addMemberToSite,
        createPDSite: createPDSite,
        createSite: createSite,
        getAllOrganizationalCenters: getAllOrganizationalCenters,
        getAllOwners: getAllOwners,
        getSite: getSite,
        getTemplateNames: getTemplateNames,
        getSites: getSites,
        getSitesByQuery: getSitesByQuery,
        getSitesPerUser: getSitesPerUser,
        loadSiteData: loadSiteData,
        updatePDSite: updatePDSite,
        updateSite: updateSite,
        removeMemberFromSite: removeMemberFromSite,
        updateRoleOnSiteMember: updateRoleOnSiteMember,
        deleteSite: deleteSite,
        createFolder: createFolder,
        deleteFile: deleteFile,
        uploadFiles: uploadFiles,
        uploadNewVersion: uploadNewVersion,
        updateNode: updateNode,
        addUser: addUser,
        createProjectLink: createProjectLink,
        deleteLink: deleteLink,
        createMembersPDF: createMembersPDF,
        getSiteGroups: getSiteGroups,
        createTemplate: createTemplate,
        createExternalUser: createExternalUser,
        checkIfEmailExists: checkIfEmailExists,
        getNode: getNode,
        getSiteUserPermissions: getSiteUserPermissions,
        getPermissions: getPermissions,
        setUserManagedProjects: setUserManagedProjects,
        getUserManagedProjects: getUserManagedProjects,
        getGroupsAndMembers: getGroupsAndMembers,
        getSiteOwner: getSiteOwner,
        getSiteManager: getSiteManager,
        createDocumentNotification: createDocumentNotification,
        createReviewNotification: createReviewNotification,

    };
    
    return service;

    function getSite() {
        return site;
    }
    
    function getAllOwners() {
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
    }

    function getTemplateNames() {
        return systemSettingsService.getTemplates().then(function (response) {
            var templates = [];

            angular.forEach(response, function(template) {
                templates.push({
                    "shortName": template.shortName,
                    "displayName": template.title
                });
            });

            return templates;
        });
    }
    
    function getAllOrganizationalCenters() {
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
    }

    function getSites() {
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
    }

    function getSitesPerUser() {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "getSitesPerUser"
        }).then(
            function (response) {
                return response.data;
            },
            function (err) {
                console.log(err);
            }
        );
    }

    function getSitesByQuery(query) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "getSitesPerUser",
            PARAM_USERNAME: "query"
        }).then(function (response) {
            return response.data;
        });
    }

    function createSite(siteName, siteDescription, siteVisibility) {
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
    }

    // function updateSite(shortName, newName, description, visibility) {  
    function updateSite(site) {
        return $http.put('/api/sites/' + site.shortName, {
            shortName: site.shortName,
            sitePreset: "default",
            title: site.siteName,
            description: site.description,
            visibility: site.visibility
        }).then(function (response) {
            var isInherited = response.data.isPublic;
            getNode(site.shortName, "documentLibrary", "").then(function (response) {
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
    }

    function loadSiteData(shortName) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "getSite",
            PARAM_SITE_SHORT_NAME: shortName
        }).then(function (response) {
            site = response.data[0];
            return site;
        });
    }

    function createPDSite(siteName, description, sbsys, center_id, owner, manager, visibility, template) {
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
    }

    function updatePDSite(site) {
        return $http.post('/alfresco/service/projectdepartment', {
            PARAM_NAME: site.title,
            PARAM_SITE_SHORT_NAME: site.shortName,
            PARAM_DESCRIPTION: site.description,
            PARAM_SBSYS: site.sbsys,
            PARAM_OWNER: site.owner.userName,
            PARAM_MANAGER: site.manager.userName,
            PARAM_CENTERID: site.center_id,
            PARAM_VISIBILITY: site.visibility,
            PARAM_STATE: site.state,
            PARAM_METHOD: "updatePDSITE"
        }).then(function (response) {
            return response;
        });
    }

    function addMemberToSite(siteShortName, user, group) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "addUser",
            PARAM_SITE_SHORT_NAME: siteShortName,
            PARAM_USER: user,
            PARAM_GROUP: group
        }).then(function (response) {
            return response.data;
        });
    }

    function removeMemberFromSite(siteShortName, user, group) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "removeUser",
            PARAM_SITE_SHORT_NAME: siteShortName,
            PARAM_USER: user,
            PARAM_GROUP: group
        }).then(function (response) {
            console.log(response);
            return response.data;
        });

    }

    function updateRoleOnSiteMember(siteName, member, newRole) {
        return $http.put('/api/sites/' + siteName + '/memberships', {
            role: newRole,
            person: {
                userName: member
            }
        }).then(function (response) {
            return response.data;
        });
    }

    function deleteSite(siteName) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "deleteSite",
            PARAM_SITE_SHORT_NAME: siteName
        }).then(function (response) {
            return response.data;
        });
    }

    function createFolder(type, props) {
        return $http.post('/api/type/' + type + '/formprocessor', props).then(function (response) {
            var nodeRef = response.data.persistedObject;
            return nodeRef;
        });
    }

    function deleteFile(nodeRef) {
        var url = '/slingshot/doclib/action/file/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri;
        return $http.delete(url).then(function (result) {
            return result.data;
        });
    }

    function uploadFiles(file, destination, extras) {
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
    }
    
    function uploadNewVersion(file, destination, existingNodeRef) {
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
    }

    function updateNode(nodeRef, props) {
        return $http.post('/api/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri + '/formprocessor', props).then(function (response) {
            return response.data;
        });
    }

    function addUser(siteShortName, user, group) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "addUser",
            PARAM_SITE_SHORT_NAME: siteShortName,
            PARAM_USER: user,
            PARAM_GROUP: group
        }).then(function (response) {
            return response.data;
        });
    }

    function createProjectLink(destination) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "addLink",
            PARAM_SOURCE: site.shortName,
            PARAM_DESTINATION: destination
        }).then(function (response) {
            //console.log(response.data)
            return response.data;
        });
    }
    
    function deleteLink(source, destination) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "deleteLink",
            PARAM_SOURCE: source,
            PARAM_DESTINATION: destination
        }).then(function (response) {
            console.log(response.data);
            return response.data;
        });
    }

    function createMembersPDF(shortName) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "createMembersPDF",
            PARAM_SITE_SHORT_NAME: shortName
        }).then(function (response) {
            return response.data;
        });
    }

    function getSiteGroups(siteType) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "getSiteGroups",
            PARAM_SITE_TYPE: siteType
        }).then(function (response) {

            angular.forEach(response.data, function (group) {
                group.members = [];
                if (group.collapsed)
                    group.open = false;
            });

            return response.data;
        });
    }

    function createTemplate(shortName, description) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "createTemplate",
            PARAM_SITE_SHORT_NAME: shortName,
            PARAM_DESCRIPTION: description
        }).then(function (response) {
            return response.data;
        });
    }

    function createExternalUser(siteShortName, firstName, lastName, email, groupName) {
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
    }

    function checkIfEmailExists(email) {
        return $http.post('/alfresco/service/users', {
            PARAM_METHOD: "checkEmailIfExists",
            PARAM_EMAIL: email
        }).then(function (response) {
            return response;
        });
    }

    function getNode(siteName, container, path) {
        return $http.get('/slingshot/doclib/treenode/site/' + siteName + '/' + container + '/' + path).then(function (response) {
            return response.data;
        });
    }

    function getSiteUserPermissions(siteShortName) {

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
    }
    
    function getPermissions() {
        return currentPermissions;
    }

    function setUserManagedProjects() {
        getSitesPerUser().then(function (response) {
            var projects = [];
            for (var i in response) {
                if (response[i].shortName !== site.shortName && response[i].current_user_role == managerRole)
                    projects.push(response[i]);
            }
            userManagedProjects = projects;
        });
    }

    function getUserManagedProjects() {
        return userManagedProjects;
    }

    // function getGroupsAndMembers() {
    //     return $http.post("/alfresco/service/groups", {
    //         PARAM_METHOD: "getGroupsAndMembers",
    //         PARAM_SITE_SHORT_NAME: site.shortName
    //     }).then(function (response) {
    //         groups = response.data;
    //         return response.data;
    //     });
    // }

    function getGroupsAndMembers () {
        return $http.post("/alfresco/service/groups", {
            PARAM_METHOD: "getGroupsAndMembers",
            PARAM_SITE_SHORT_NAME: site.shortName,
            PARAM_GROUP_TYPE: "USER"
        }).then(function (response) {
            groups = response.data;
            groups.forEach(function (group) {
                group[1].forEach(function (member) {
                    var avatar = avatarUtilsService.getAvatarFromUser(member);
                    member.avatar = sessionService.makeURL("/alfresco/s/" + avatar);
                });
            });
            return groups;
        });
    }

    function getSiteOwner() {
        return getSiteGroup('PD_PROJECTOWNER');
    }

    function getSiteManager() {
        return getSiteGroup('PD_PROJECTMANAGER');
    }

    function getSiteGroup(shortName) {
        return getGroupsAndMembers().then(function(groups) {
            var members = {};

            angular.forEach(groups,function(group) {
                if(group[0].shortName == shortName) {
                    members = group[1][0];
                }
            });

            return members;
        });
    }

    function createDocumentNotification(nodeRef, fileName) {

        var id = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        var subject = "Nyt dokument i " + site.title;
        var message = "Et nyt dokument \"" + fileName + "\" er blevet uploadet af " + currentUser.displayName;
        var link = "#!/dokument/" + id;

        // Iterating list of items.
        angular.forEach(groups, function (group) {
            angular.forEach(group[1], function (member) {
                if (member.userName != currentUser.userName) {
                    var preferenceFilter = "dk.magenta.sites.receiveNotifications";
                    var receiveNotifications = "true";

                    if (member.preferences[preferenceFilter] !== null)
                        receiveNotifications = member.preferences[preferenceFilter];

                    if (receiveNotifications !== null && receiveNotifications == "true") {
                        var notification = {
                            receiver: member.userName,
                            subject: "Reivew forespørgsel",
                            message: message,
                            link: link,
                            wtype: "new-doc",
                            shortName: site.shortName
                        };
                        createNotification(notification);
                    }
                }
            });
        });
    }

    function createReviewNotification(documentNodeRef, receiver, message) {
        var ref = documentNodeRef.split("/")[3];
        var link = "#!/dokument/" + ref + "?dtype=wf" + "&from=" + currentUser.userName;

        var notification = {
            receiver: receiver,
            subject: "Reivew forespørgsel",
            message: message,
            link: link,
            wtype: "review-request",
            shortName: site.shortName
        };
        createNotification(notification);
    }
    function createNotification(notification) {
        notificationsService.addNotice(notification.receiver, notification.subject, notification.message, notification.link, notification.wtype, notification.shortName);
    }

}