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
        getCurrentUserSiteRole: function (siteShortName) {
            //https:frank.opendesk.dk/alfresco/s/api/sites/Heinetestxx
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getCurrentUserSiteRole",
                PARAM_SITE_SHORT_NAME: siteShortName
            }).then(
                function (response) {
                    if(response.data[0].role == null)
                        return 'SiteConsumer';
                    return response.data[0].role;
                }, function (err) {
                    // If user isn't registered as a member, grant siteConsumer role
                    return 'SiteConsumer';
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
        createSite: function (siteName, siteDescription, siteVisibility) {
            return $http.post('/alfresco/service/sites', {
                PARAM_METHOD : "createSite",
                PARAM_SITE_DISPLAY_NAME: siteName,
                PARAM_DESCRIPTION: siteDescription,
                PARAM_VISIBILITY: siteVisibility
            }).then(
                function (response) {
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
                PARAM_SITE_SHORT_NAME: shortName
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
        getMemberFromSite: function (siteName, member) {
            return $http.get('/api/sites/' + siteName + '/memberships/' + member).then(function(response) {
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
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "deleteSite",
                PARAM_SITE_SHORT_NAME : siteName
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
            console.log("remove user" + user);
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "removeUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function(response) {
                console.log(response);
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
                PARAM_SITE_SHORT_NAME: shortName
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
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function(response) {
                return response.data;
            });
        },
        makeSiteATemplate : function (shortName, templateName) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "makeSiteATemplate",
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function(response) {
                return response.data;
            });
        },
        createTemplate : function (shortName, description) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "createTemplate",
                PARAM_SITE_SHORT_NAME: shortName,
                PARAM_DESCRIPTION: description
            }).then(function(response) {
                return response.data;
            });
        },
        loadFromSbsys : function() {
        	return $http.post("/alfresco/service/sbsys/fakedownload", {
        		destinationNodeRef : "workspace://SpacesStore/22d590d5-99a1-4704-9b70-5f6b1f5e16f7",
        		nodeRefs : ["workspace://SpacesStore/13ea501d-4dd7-4389-8764-4b3850de487c", "workspace://SpacesStore/7acc29d6-265e-4b34-b2ef-88235dfdbcfb"]
        	}).then(function(response) {
        		return response.data;
        	});
        },
        getTemplateDocuments : function() {
            return $http.get("/alfresco/service/template?method=getAllTemplateDocuments", {
            }).then(function(response) {
                return response.data[0];
            });
        },
        createDocumentFromTemplate : function(nodeid, currentfolder) {
            return $http.get("/alfresco/service/template?method=makeNewDocumentFromTemplate&template_nodeid=" + nodeid + "&destination_nodeRefid=" + currentfolder, {
            }).then(function(response) {
                return response;
            });
        }




    };
});
