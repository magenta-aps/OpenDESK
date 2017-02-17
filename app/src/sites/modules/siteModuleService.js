'use strict';

angular
    .module('openDeskApp.sites')
    .factory('siteModuleService', function () {
    
        var service = {
            
            registerProjectType: registerProjectType,
            getProjectTypes: getProjectTypes
            
        };
        var ptypes = [];
        
        function registerProjectType(type, template) {
            ptypes.push({
                type: type,
                template: template
            });
        }
        
        function getProjectTypes() {
            return ptypes;
        }
        
        return service;
    
    });
