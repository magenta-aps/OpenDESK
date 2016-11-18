'use strict';

angular.module('openDeskApp.sites').factory('siteService', function ($http, $window, alfrescoNodeUtils, userService) {
    var restBaseUrl = '/alfresco/s/api/';

    return {
        getSiteMembers: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            })
        },
        getSites: function () {
            return $http.get('/api/sites').then(function (response) {
                return response.data;
            })
        },
        getSitesByQuery: function (query) {
            return $http.get('/api/sites?nf=' + query).then(function (response) {
                return response.data;
            })
        },
        createSite: function (siteName, siteDescription) {
            return $http.post('/api/sites', {
                shortName: siteName,
                sitePreset: "default",
                title: siteName,
                description: siteDescription
            }).then(function (response) {

                // create the rootfolder documentLibrary manually as we dont use the siteService on the share side
                // TODO: make use of the createFolder
                var nodeRef = response.data.node;
                nodeRef = nodeRef.replace("/alfresco/service/api/node/",'');

                var props = {
                    prop_cm_name: "documentLibrary",
                    prop_cm_title: "documentLibrary",
                    alf_destination: alfrescoNodeUtils.processNodeRef(nodeRef).nodeRef
                };

                var type = "cm:folder";

                $http.post('/api/type/' + type + '/formprocessor', props).then(function (response) {
                    var nodeRef = response.data.persistedObject;
                    return nodeRef;
                });

                return response.data;
            })
        },
        updateSiteName: function (shortName, newName) {
            return $http.put('/api/sites/' + shortName, {
                shortName: shortName,
                sitePreset: "default",
                title: newName,
                description: "cropA"
            }).then(function (response) {
                return response.data;
            })
        },
        loadSiteData: function (shortName) {
            return $http.get('/api/sites/' + shortName).then(function (response) {
                return response.data.title;
            })
        },
        addMemberToSite: function (siteName, member, role) {
            return $http.post('/api/sites/' + siteName + '/memberships', {
                role: role,
                person: {userName: member}
            }).then(function (response) {
                return response.data;
            })
        },
        removeMemberFromSite: function (siteName, member) {
            return $http.delete('/api/sites/' + siteName + '/memberships/' + member).then(function(response) {
                return response.data;
            })
        },
        updateRoleOnSiteMember: function (siteName, member, newRole) {
            return $http.put('/api/sites/' + siteName + '/memberships', {
                role: newRole,
                person: {userName: member}
            }).then(function (response) {
                return response.data;
            })
        },
        getSiteRoles: function (siteName) {
            return $http.get('/api/sites/' + siteName + "/roles").then(function (response) {
                return response.data;
            })
        },
        deleteSite: function (siteName) {
            return $http.delete('/api/sites/' + siteName).then(function (response) {
                return response.data;
            })
        },
        createFolder: function (type, props) {
            return $http.post('/api/type/' + type + '/formprocessor', props).then(function (response) {
                var nodeRef = response.data.persistedObject;
                return nodeRef;
            })
        },
        deleteFolder: function (nodeRef) {
            var url = '/slingshot/doclib/action/folder/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri;
            return $http.delete(url).then(function (result) {
                return result.data;
            })
        },
        deleteFile: function (nodeRef) {
            var url = '/slingshot/doclib/action/file/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri;
            return $http.delete(url).then(function (result) {
                return result.data;
            })
        },
        getAllUsers: function (filter) {
            return userService.getPeople("?filter=" + filter).then(function (result) {
                return result.people;
            });
        },
        uploadFiles: function (file, destination, extras) {

            var formData = new FormData();
            formData.append("filedata", file);
            formData.append("filename", file.name);
            formData.append("destination", destination ? destination : null);

            return $http.post("/api/upload", formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function (response) {
                return response;
            });
        },
        moveNodeRefs: function (sourceNodeRefs, destNodeRef, parentNodeRef) {
            console.log('move noderefs:');
            console.log(sourceNodeRefs);
            console.log(destNodeRef);
            console.log(parentNodeRef);
            return $http.post('/slingshot/doclib/action/move-to/node/' + alfrescoNodeUtils.processNodeRef(destNodeRef).uri, {
                nodeRefs: sourceNodeRefs,
                parentId: parentNodeRef
            }).then(function (response) {
                console.log(response);
                return response;
            }).catch(function (response) {
                console.log(response);
                return response;
            });
        },
        copyNodeRefs: function (sourceNodeRefs, destNodeRef, parentNodeRef) {
            return $http.post('/slingshot/doclib/action/copy-to/node/' + alfrescoNodeUtils.processNodeRef(destNodeRef).uri, {
                nodeRefs: sourceNodeRefs,
                parentId: parentNodeRef
            }).then(function (response) {
                return response;
            }, function() {
                return response;
            });
        },
        updateNode: function (nodeRef, props) {
            return $http.post('/api/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri + '/formprocessor', props).then(function (response) {
                return response.data;
            });
        }
    }
});
