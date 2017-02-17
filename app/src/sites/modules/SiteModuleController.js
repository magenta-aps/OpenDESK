'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteModuleController', SiteModuleController)
    .directive('projectActions', projectActions);
    
    function SiteModuleController($scope, siteModuleService) {
        
        var ctrl = this;
        
        ctrl.ptypes = siteModuleService.getProjectTypes();
        ctrl.project = $scope.project;
        
        for (var t in ctrl.ptypes) {
            if (ctrl.ptypes[t].type === ctrl.project.type) {
                ctrl.currentptype = ctrl.ptypes[t];
            }
        }
        
    }
    
    function projectActions() {
        return {
            restrict: 'E',
            scope: {
                project: '=info'
            },
            templateUrl: 'app/src/sites/modules/view/siteActions.html'
        };
    }
