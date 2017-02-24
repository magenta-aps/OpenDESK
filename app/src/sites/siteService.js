'use strict';

angular.module('openDeskApp.sites').factory('siteService', function ($http, $window, alfrescoNodeUtils, userService, documentService, groupService) {
    
    var restBaseUrl = '/alfresco/s/api/';
    
    return {
        getSiteMembers: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            });
        },
        getAllMembers: function (siteShortName, siteType) {

            //console.log("siteType :" + siteType);
            var allMembers = [];

            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(
                function (response) {
                    var site_members = response.data;
    
                    for (var i in site_members) {
                        allMembers.push(site_members[i].authority.userName);
                    }
    
                    if (siteType === "PD-Project") {
                        return $http.post("/alfresco/service/groups", {
                            PARAM_METHOD : "getAllMembers",
                            PARAM_SITE_SHORT_NAME: siteShortName
                        }).then(function (response) {
                            var pd_site_members = response.data[0];
    
                            for (var i in pd_site_members) {
                                var username = pd_site_members[i].username;
                                if(allMembers.indexOf(username) == -1)
                                    allMembers.push(username);
                            }
                            return allMembers;
                        })
                    } else {
                        return allMembers;
                    }
                },
                function (err) {
                    //console.log('Error retrieving site members');
                    //console.log(err);
                }
                
            );
        },
        getSiteUserRole: function (siteShortName, userName) {
            //https:frank.opendesk.dk/alfresco/s/api/sites/Heinetestxx/memberships/flemming
            return $http.get('/api/sites/' + siteShortName + '/memberships/' + userName ).then(
                function (response) {
                    return response.data.role;
                }, function (err) {
                    // If user isn't registered as a member, grant siteConsumer role
                    return 'siteConsumer';
                }
            ) 
        },
        getSites: function () {
            return $http.post("/alfresco/service/sites", { PARAM_METHOD : "getAll" }).then(function(response) {
                return response.data;
            })
        },
        getSitesPerUser: function () {
            return $http.post("/alfresco/service/sites", { PARAM_METHOD : "getSitesPerUser" }).then(
                function(response) {
                    //console.log(response);
                    return response.data;
                },
                function(err) {
                    //console.log(err);
                }
            )
        },
        getSitesByQuery: function (query) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getSitesPerUser",
                PARAM_USERNAME: "query"
            }).then(function(response) {
                return response.data;
            })
        },
        createSite: function (siteShortName, siteName, siteDescription) {
            return $http.post('/api/sites', {
                shortName: siteShortName,
                sitePreset: "default",
                title: siteName,
                description: siteDescription
            }).then(
                function (response) {
                    // create the rootfolder documentLibrary manually as we dont use the siteService on the share side
                    // TODO: make use of the createFolder
                    var nodeRef = response.data.node;
                    nodeRef = nodeRef.replace("/alfresco/service/api/node/", '');

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
                },
                function(error) {
                    if(error.data.status.code == "400" && error.data.message == "error.duplicateShortName")
                        return null;
                }
            );
        },
        updateSiteName: function (shortName, newName, description) {
            return $http.put('/api/sites/' + shortName, {
                shortName: shortName,
                sitePreset: "default",
                title: newName,
                description: (description && description !== '') ? description: ''
            }).then(function (response) {
                return response.data;
            });
        },
        loadSiteData : function (shortName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getSite",
                PARAM_SHORT_NAME: shortName
            }).then(function(response) {
                //console.log('got site data');
                //console.log(response);
                return response.data[0];
            });
        },
        addMemberToSite: function (siteName, member, role) {
            return $http.post('/api/sites/' + siteName + '/memberships', {
                role: role,
                person: {userName: member}
            }).then(function (response) {
                return response.data;
            });
        },
        removeMemberFromSite: function (siteName, member) {
            return $http.delete('/api/sites/' + siteName + '/memberships/' + member).then(function(response) {
                return response.data;
            });
        },
        updateRoleOnSiteMember: function (siteName, member, newRole) {

            return $http.put('/api/sites/' + siteName + '/memberships', {
                role: newRole,
                person: {userName: member}
            }).then(function (response) {
                return response.data;
            });
        },
        getSiteRoles: function (siteName) {
            return $http.get('/api/sites/' + siteName + "/roles").then(function (response) {
                return response.data;
            });
        },
        deleteSite: function (siteName) {
            return $http.delete('/api/sites/' + siteName).then(function (response) {
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
        getAllUsers: function (filter) {
            return userService.getPeople("?filter=" + filter).then(function (result) {
                //console.log(result);
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
        uploadNewVersion: function (file, destination, existingNodeRef, extras) {

            var formData = new FormData();
            formData.append("filedata", file);
            formData.append("updatenoderef", existingNodeRef);
            formData.append("majorversion", false);
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
            //console.log('move noderefs:');
            //console.log(sourceNodeRefs);
            //console.log(destNodeRef);
            //console.log(parentNodeRef);
            return $http.post('/slingshot/doclib/action/move-to/node/' + alfrescoNodeUtils.processNodeRef(destNodeRef).uri, {
                nodeRefs: sourceNodeRefs,
                parentId: parentNodeRef
            }).then(function (response) {
                //console.log(response);
                return response;
            }).catch(function (response) {
                //console.log(response);
                return response;
            });
        },
        copyNodeRefs: function (sourceNodeRefs, destNodeRef, parentNodeRef) {
            return $http.post('/slingshot/doclib/action/copy-to/node/' + alfrescoNodeUtils.processNodeRef(destNodeRef).uri, {
                nodeRefs: sourceNodeRefs,
                parentId: parentNodeRef
            }).then(
                function (response) {
                    return response;
                },
                function(err) {
                    return err;
                }
            );
        },
        updateNode: function (nodeRef, props) {
            return $http.post('/api/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri + '/formprocessor', props).then(function (response) {
                return response.data;
            });
        },
        getContents: function (node) {
            return $http.get("/alfresco/service/contents?node=" + node).then(function(response) {

                //console.log(response.data);
                return response.data;
            });
        },
        addUser: function (siteShortName, user, group) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "addUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function(response) {

                //console.log(response.data);
                return response.data;
            });
        },
        removeUser: function (siteShortName, user, group) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "removeUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function(response) {

                //console.log(response.data);
                return response.data;
            });
        },
        addRole : function (siteShortName, user, role) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "addPermission",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_ROLE: role
            }).then(function(response) {
                //console.log(response.data)
                return response.data;
            });
        },
        removeRole : function (siteShortName, user, role) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "removePermission",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_ROLE: role
            }).then(function(response) {
                //console.log(response.data)
                return response.data;
            });
        },
        //getGroupMembers : function (siteShortName, groupName) {
        //    return $http.post("/alfresco/service/sites", {
        //        PARAM_METHOD : "getDBID",
        //        PARAM_SITE_SHORT_NAME: siteShortName
        //    }).then(function(response) {
        //
        //        var dbid = response.data[0].DBID;
        //        console.log(dbid);
        //
        //        var requestName = dbid + "_" + groupName;
        //
        //        return groupService.getGroupMembers(requestName).then(function(r) {
        //            return r.data;
        //        });
        //
        //        return response.data;
        //    });
        //},
        getGroupMembers : function (siteShortName, groupName) {
            return groupService.getGroupInfo(siteShortName, groupName).then(function(r) {
                return r;
            });
        },
        createLink : function (source, destination) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "addLink",
                PARAM_SOURCE: source,
                PARAM_DESTINATION: destination
            }).then(function(response) {
                //console.log(response.data)
                return response.data;
            });
        },
        deleteLink : function (source, destination) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "deleteLink",
                PARAM_SOURCE: source,
                PARAM_DESTINATION: destination
            }).then(function(response) {
                console.log(response.data);
                return response.data;
            });
        },
        createMembersPDF : function (shortName) {

            //console.log("hvad er ");
            //console.log(shortName)
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "createMembersPDF",
                PARAM_SHORT_NAME: shortName
            }).then(function(response) {

                  // do a get on the returned noderef
                //alfresco/service/api/node/content/workspace/SpacesStore/90defc67-622f-4bd4-acb2-e20d569b16f4

                //console.log("**********");
                //console.log(response.data)
                return response.data;
            });
        },
        getSiteType : function (shortName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getSiteType",
                PARAM_SHORT_NAME: shortName
            }).then(function(response) {
                return response.data;
            });
        },
        loadFromSbsys : function() {
        	return $http.post("/alfresco/service/sbsys/fakedownload", {
        		destinationNodeRef : "workspace://SpacesStore/9a85d4fb-472e-4cb4-ba25-a4d7b646387d",
        		nodeRefs : ["workspace://SpacesStore/bf8a95ef-c6ba-42db-bc49-70dcbbe8ddab","workspace://SpacesStore/52fbbc13-38c0-4daa-8f62-362e319efea3"]
        	}).then(function(response) {
        		return response.data;
        	});
        }
    };
});
