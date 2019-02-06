// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
