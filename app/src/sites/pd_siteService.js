'use strict';

angular.module('openDeskApp.sites').factory('pd_siteService', function ($http, $window, alfrescoNodeUtils, userService, documentService) {
    var restBaseUrl = '/alfresco/s/api/';

    return {


        createPDSite: function (siteName, description, sbsys, center_id, owner, manager, template) {
            return $http.post('/alfresco/service/projectdepartment-create', {
                PARAM_NAME: siteName,
                PARAM_DESCRIPTION : description,
                PARAM_SBSYS : sbsys,
                PARAM_OWNER : owner,
                PARAM_MANAGER : owner,
                PARAM_CENTERID : center_id,
                PARAM_TEMPLATE_NODEREF : template
            }).then(function (response) {
                console.log(response);
                return response;
            })
        }

    }
});
