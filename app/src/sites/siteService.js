'use strict';

angular.module('openDeskApp.sites').factory('siteService', function ($http, $window, alfrescoNodeUtils) {
    
    var restBaseUrl = '/alfresco/s/api/';

    var _currentSiteType = "";
    
    return {


        setType: function (t){
            _currentSiteType = t;
        },
        getType: function() {
            return _currentSiteType;
        },
        getSiteMembers: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            });
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
            return $http.post("/alfresco/service/sites", {PARAM_METHOD: "getAll"}).then(
                function (response) {
                    return response.data;
                }, function (error) {
                    console.log("Error retrieving list of all sites.");
                    console.log(error);
                }
            )
        },
        getSitesPerUser: function () {
            return $http.post("/alfresco/service/sites", { PARAM_METHOD : "getSitesPerUser" }).then(
                function(response) {
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
        updateSite: function (shortName, newName, description, visibility) {
            return $http.put('/api/sites/' + shortName, {
                shortName: shortName,
                sitePreset: "default",
                title: newName,
                description: (description && description !== '') ? description: '',
                visibility : visibility
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
        addMemberToSite: function (siteShortName, user, group) {
             return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "addUser",
                PARAM_SITE_SHORT_NAME: siteShortName,
                PARAM_USER: user,
                PARAM_GROUP: group
            }).then(function(response) {
                return response.data;
            });

        },
        getMemberFromSite: function (siteName, member) {
            return $http.get('/api/sites/' + siteName + '/memberships/' + member).then(function(response) {
                return response.data;
            });
        },
        removeMemberFromSite: function (siteShortName, user, group) {
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
        updateRoleOnSiteMember: function (siteName, member, newRole) {

            return $http.put('/api/sites/' + siteName + '/memberships', {
                role: newRole,
                person: {userName: member}
            }).then(function (response) {
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
        uploadFiles: function (file, destination, extras) {




            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "returnFileName",
                PARAM_FILENAME: file.name,
                PARAM_DESTINATION: destination
            }).then(function(response) {

                var formData = new FormData();
                formData.append("filedata", file);
                formData.append("filename", response.data[0].fileName);
                formData.append("destination", destination ? destination : null);



                return $http.post("/api/upload", formData, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function (response) {
                    return response;
                });
            });




        },
        uploadNewVersion: function (file, destination, existingNodeRef, extras) {
            console.log("inside uploadNewVersion");

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
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "createMembersPDF",
                PARAM_SITE_SHORT_NAME: shortName
            }).then(function(response) {
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
        getSiteGroups : function (siteType) {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getSiteGroups",
                PARAM_SITE_TYPE: siteType
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
            return $http.get("/alfresco/s/slingshot/doclib2/doclist/type/site/sbsysfakedata/documentLibrary", {}).then(function (sbsysfakedataResponse) {
                var nodeRefs = [];
                for (var i in sbsysfakedataResponse.data.items)
                    nodeRefs.push(sbsysfakedataResponse.data.items[i].node.nodeRef);

                return $http.get("/alfresco/s/slingshot/doclib/container/SBSYS-funktionalitet/documentLibrary", {}).then(function (SbsysfunktionalitetResponse) {

                    var destinationNodeRef = SbsysfunktionalitetResponse.data.container.nodeRef;
                    return $http.post("/alfresco/service/sbsys/fakedownload", {
                        destinationNodeRef: destinationNodeRef,
                        nodeRefs: nodeRefs
                    }).then(function (response) {
                        return response.data;
                    });
                });
            });
        },
        getTemplateDocuments : function() {
            return $http.post("/alfresco/service/template", {
                PARAM_METHOD: "getAllTemplateDocuments"
                }
            ).then(function(response) {
                return response.data[0];
            });
        },
        createDocumentFromTemplate : function(nodeid, currentfolder, newName) {
            return $http.post("/alfresco/service/template", {
                PARAM_METHOD: "makeNewDocumentFromTemplate",
                PARAM_TEMPLATE_NODE_ID: nodeid,
                PARAM_DESTINATION_NODEREF: currentfolder,
                PARAM_NODE_NAME: newName
            }).then(function(response) {
                return response;
            });
        },

        createExternalUser : function(siteShortName, firstName, lastName, email, groupName) {
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

        getNode: function (siteName, container, path) {
            return $http.get('/slingshot/doclib/treenode/site/' + siteName + '/' + container + '/' + path).then(function(response) {
                return response.data;
            });
        },

    };
});
