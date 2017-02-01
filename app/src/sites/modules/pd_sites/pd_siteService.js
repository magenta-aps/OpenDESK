'use strict';

angular
    .module('openDeskApp.pd_sites')
    .factory('pd_siteService', function ($http, $window, alfrescoNodeUtils, userService, documentService, groupService) {
    
    var restBaseUrl = '/alfresco/s/api/';

    return {


        createPDSite: function (siteName, description, sbsys, center_id, owner, manager) {
            return $http.post('/alfresco/service/projectdepartment-create', {
                PARAM_NAME: siteName,
                PARAM_DESCRIPTION : description,
                PARAM_SBSYS : sbsys,
                PARAM_OWNER : owner,
                PARAM_MANAGER : manager,
                PARAM_CENTERID : center_id,
                PARAM_METHOD : "createPDSITE"
            }).then(function (response) {
                console.log(response);
                return response;
            })
        },

        addTemplate: function (siteName, template) {
            return $http.post('/alfresco/service/projectdepartment-create', {
                PARAM_NAME: siteName,
                PARAM_TEMPLATE : template
            }).then(function (response) {
                console.log(response);
                return response;
            })
        },

        getAllManagers: function () {
            groupService.getGroupMembers("GLOBAL_Projectmanagers").then (function(response) {
               console.log(response);
            });
        },
        getAllOrganizationalCenters: function () {
            groupService.getGroupMembers("OrganizationalCenters").then (function(response) {
                console.log(response);
            });
        }

    };
    
});
