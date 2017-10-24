'use strict';

angular
    .module('openDeskApp.filebrowser')
    .directive('odTemplateList', function () {
    return {
        restrict: 'E',
        scope: {
            templates: "=odTemplates",
            hasPermission: "@odPermission",
            icon: "@odIcon",
            label: "@odLabel"
        },
        templateUrl: 'app/src/filebrowser/template/list/templateList.view.html',
        controller: 'TemplateListController',
        controllerAs: 'vm'
    };
});