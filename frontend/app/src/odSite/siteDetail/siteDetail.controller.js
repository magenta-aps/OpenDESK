'use strict'

angular
  .module('openDeskApp.site')
  .controller('SiteDetailController', SiteDetailController)

function SiteDetailController ($scope, $mdDialog, siteService, $stateParams, $translate,
  browserService, headerService) {
  $scope.history = []
  $scope.showGroupList = []

  var vm = this

  vm.cancelDialog = cancelDialog
  vm.groups = {}
  vm.permissions = {}
  vm.site = {}
  vm.searchTextList = []
  vm.templateProjectLabel = 'Template-Project'

  // sets the margin to the width of sidenav
  var tableHeight = $(window).height() - 300 - $('header').outerHeight() - $('#filebrowser-breadcrumb').outerHeight() - $('md-tabs-wrapper').outerHeight() - $('#table-actions').outerHeight()
  $('#table-container').css('max-height', tableHeight + 'px')

  activate()

  function activate () {
    siteService.loadSiteData($stateParams.projekt).then(function (result) {
      vm.site = result

      browserService.setTitle(vm.site.title)
      headerService.setTitle($translate.instant('SITES.' + vm.site.type + '.NAME') + ' : ' + vm.site.title)

      siteService.setUserManagedProjects()
      getSiteUserPermissions()
    }
    )
  }

  function getSiteUserPermissions () {
    siteService.getSiteUserPermissions($stateParams.projekt).then(function (permissions) {
      vm.permissions = permissions
    })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }
}
