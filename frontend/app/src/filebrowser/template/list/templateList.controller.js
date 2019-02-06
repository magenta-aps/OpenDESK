// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import createFromTemplateTemplate from '../create/createFromTemplate.view.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('TemplateListController', ['$scope', '$mdDialog', 'templateService', TemplateListController])

function TemplateListController ($scope, $mdDialog, templateService) {
  var vm = this

  vm.createContentFromTemplateDialog = createContentFromTemplateDialog

  activate()

  function activate () {
  }

  function createContentFromTemplateDialog (template, contentType) {
    templateService.setTemplate(template, contentType)

    $mdDialog.show({
      template: createFromTemplateTemplate,
      controller: 'CreateFromTemplateController',
      controllerAs: 'vm',
      clickOutsideToClose: true
    })
  }
}
