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
    var adminPermissions = {
        isManager: true,
        isMember: true,
        canEdit: true,
        userRole: managerRole
    };

    var service = {
        getSite: getSite,
        getSiteMembers: getSiteMembers,
        getAllOwners: getAllOwners,
        getTemplateNames: getTemplateNames,
        getAllOrganizationalCenters: getAllOrganizationalCenters,
        getSites: getSites,
        getSitesPerUser: getSitesPerUser,
        getSitesByQuery: getSitesByQuery,
        createSite: createSite,
        updateSite: updateSite,
        loadSiteData: loadSiteData,
        createPDSite: createPDSite,
        updatePDSite: updatePDSite,
        addMemberToSite: addMemberToSite,
        getMemberFromSite: getMemberFromSite,
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
        createDocumentNotification: createDocumentNotification,
        createReviewNotification: createReviewNotification,

    };
    
    return service;

    function getSite() {
        return site;
    }
    
    function getSiteMembers(siteShortName) {
        return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
            return response.data;
        });
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
            return response;
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
                //console.log(err);
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

    function updateSite(shortName, newName, description, visibility) {
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

    function updatePDSite(shortName, siteName, description, sbsys, center_id, owner, manager, visibility, state) {
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

    function getMemberFromSite(siteName, member) {
        return $http.get('/api/sites/' + siteName + '/memberships/' + member).then(function (response) {
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

    function getGroupsAndMembers() {
        return $http.post("/alfresco/service/groups", {
            PARAM_METHOD: "getGroupsAndMembers",
            PARAM_SITE_SHORT_NAME: site.shortName
        }).then(function (response) {
            groups.list = response.data;
            return response.data;
        });
    }

    function createDocumentNotification(nodeRef, fileName) {

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
    }

    function createReviewNotification(documentNodeRef, receiver, message) {
        var sender = currentUser.userName;
        var s = documentNodeRef.split("/");
        var ref = (s[3]);
        var link = "#!/dokument/" + ref + "?dtype=wf" + "&from=" + sender;

        var sub = "Review forespørgsel";
        createNotification(receiver, sub, message, link, 'review-request', site.shortName);
    }

    function createNotification(receiver, subject, message, link, wtype, project) {
        notificationsService.addNotice(receiver, subject, message, link, wtype, project);
    }

}