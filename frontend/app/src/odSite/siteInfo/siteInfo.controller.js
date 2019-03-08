// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import siteEditTemplate from '../siteEdit/siteEdit.view.html'

angular
  .module('openDeskApp.site')
  .controller('SiteInfoController', ['$scope', '$mdDialog', 'siteService', SiteInfoController])

function SiteInfoController($scope, $mdDialog, siteService, xeditable) {
  var vm = this

  vm.editSiteDialog = editSiteDialog
  vm.hasDescription = false
  vm.permissions = []
  vm.site = {}

  $scope.siteService = siteService

  activate()

  function activate() {
    $scope.$watch('siteService.getSite()', function (site) {
      vm.site = site
      vm.hasDescription = vm.site.description.trim() !== ''
      getSiteUserPermissions()
    })
  }

  function getSiteUserPermissions() {
    siteService.getSiteUserPermissions(vm.site.shortName)
      .then(function (permissions) {
        vm.permissions = permissions
      })
  }

  function editSiteDialog(ev) {
    $mdDialog.show({
      template: siteEditTemplate,
      controller: 'SiteEditController',
      controllerAs: 'vm',
      locals: {
        sitedata: vm.site
      },
      targetEvent: ev,
      clickOutsideToClose: true
    })
  }
}
