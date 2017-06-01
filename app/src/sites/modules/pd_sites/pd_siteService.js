'use strict';

angular
    .module('openDeskApp.pd_sites')
    .factory('pd_siteService', function ($http, $window, alfrescoNodeUtils, userService, documentService, groupService, systemSettingsService) {
    
    
        var restBaseUrl = '/alfresco/s/api/';
        var service = {
            createPDSite: createPDSite,
            addTemplate: addTemplate,
            getAllManagers: getAllManagers,
            getAllOrganizationalCenters: getAllOrganizationalCenters,
            updatePDSite: updatePDSite,
            getTemplateNames: getTemplateNames,
            getPDGroupName: getPDGroupName,
            getPDGroupFullName: getPDGroupFullName,
            createExternalUser: createExternalUser
        };
        

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
                // console.log(response);
                return response;
            });
        }

        
        //All values except shortName can be empty strings to avoid updating those parameters.
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

        
        function addTemplate(siteName, template) {
            return $http.post('/alfresco/service/projectdepartment', {
                PARAM_NAME: siteName,
                PARAM_TEMPLATE: template
            }).then(function (response) {
                //console.log(response);
                return response;
            });
        }


        function getAllManagers() {
            return groupService.getGroupMembers("OPENDESK_ProjectOwners").then(
                function (response) {
                    return response;
                },
                function (error) {
                    console.log("Error retrieving list of all managers.");
                    console.log(error);
                }
            );
        }


        function getAllOrganizationalCenters() {
            return groupService.getSubGroups("OPENDESK_OrganizationalCenters").then(function (response) {
                //console.log(response);
                return response;
            }, function (error) {
                console.log("Error retrieving list of all organizational centers.");
                console.log(error);
            });
        }

        function getTemplateNames() {

            return systemSettingsService.getTemplates().then (function(response) {
                return response;
            });
        }

        function getPDGroupName(siteShortName, groupShortName) {

            var siteGroup = "site_" + siteShortName;
            if(groupShortName === "")
                return siteGroup;
            else
                return siteGroup + "_" + groupShortName;
        }

        function getPDGroupFullName(groupName) {
            return "GROUP_" + groupName;
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

        return service;

    });
