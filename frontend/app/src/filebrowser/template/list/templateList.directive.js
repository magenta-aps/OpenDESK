'use strict'
import templateListTemplate from './templateList.view.html'
angular
  .module('openDeskApp.filebrowser')
  .directive('odTemplateList', function () {
    return {
      restrict: 'E',
      scope: {
        templates: '=odTemplates',
        hasPermission: '=odPermission',
        icon: '@odIcon',
        label: '@odLabel',
        nested: '=odNested'
      },
      template: templateListTemplate,
      controller: 'TemplateListController',
      controllerAs: 'vm'
    }
  })
