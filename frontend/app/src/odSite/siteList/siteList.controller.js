'use strict'
import '../../shared/filters/exactMatchFilter'
import '../../shared/filters/isContainedFilter'
import '../../shared/filters/openeDateFilter'
import '../../shared/filters/orderByObjectFilter'
import '../../shared/directives/sort'
import '../../shared/services/alfrescoNode.service'
import '../../shared/services/translate.service'
import deleteProjectTemplate from './deleteProject.tmpl.html'
import siteCreateTemplate from '../siteCreate/siteCreate.view.html'
import updateSiteTemplate from './updateSite.tmpl.html'
import siteInfoTemplate from './siteInfo.view.html'

angular
  .module('openDeskApp.site')
  .controller('SiteListController', ['$scope', '$mdDialog', '$interval', '$translate', 'siteService', 'MemberService',
    'sessionService', 'APP_BACKEND_CONFIG', 'browserService', 'headerService', 'alfrescoNodeService', 'translateService',
    SiteListController])

function SiteListController ($scope, $mdDialog, $interval, $translate, siteService, MemberService,
  sessionService, APP_BACKEND_CONFIG, browserService, headerService, alfrescoNodeService, translateService) {
  var vm = this

  vm.cancelDialog = cancelDialog
  vm.config = APP_BACKEND_CONFIG
  vm.createSiteDialog = createSiteDialog
  vm.currentDialogDescription = ''
  vm.currentDialogShortName = ''
  vm.currentDialogSite = ''
  vm.currentDialogTitle = ''
  vm.deleteSite = deleteSite
  vm.deleteSiteDialog = deleteSiteDialog
  vm.exactMatchFilter = exactMatchFilter
  vm.infoSiteDialog = infoSiteDialog
  vm.isAdmin = sessionService.isAdmin()
  vm.isLoading = true
  vm.managerRole = 'Manager'
  vm.openMenu = openMenu
  vm.organizationalCenters = []
  vm.renameSiteDialog = renameSiteDialog
  vm.searchMembers = []
  vm.searchPeople = searchPeople
  vm.showall = false
  vm.showFilters = false
  vm.sites = []
  vm.sitesPerUser = []
  vm.states = [
    {key: 'ACTIVE', name: 'Igang'},
    {key: 'CLOSED', name: 'Afsluttet'},
    {key: '', name: 'Alle'}]
  vm.types = []
  vm.toggleFavourite = toggleFavourite
  vm.toggleFilters = toggleFilters
  vm.getFavouriteIcon = getFavouriteIcon

  $scope.reverse = false
  $scope.order = 'title'

  activate()

  function activate () {
    vm.types.push({key: 'Project', name: $translate.instant('SITES.Project.NAME')})
    if (vm.config.enableProjects) vm.types.push({key: 'PD-Project', name: $translate.instant('SITES.PD-Project.NAME')})
    vm.types.push({key: '', name: $translate.instant('COMMON.ALL')})

    vm.sitesName = translateService.getSitesName()
    var title = $translate.instant(vm.sitesName)
    browserService.setTitle(title)
    headerService.setTitle(title)

    // sets the margin to the width of sidenav
    var tableHeight = $(window).height() - 200 - $('header').outerHeight() - $('#table-header').outerHeight() - $('#table-actions').outerHeight()
    $('#table-container').css('max-height', tableHeight + 'px')

    getSites()
    getSitesPerUser()
    getAllOrganizationalCenters()
  }

  function exactMatchFilter (project) {
    if (vm.search === undefined || vm.search.type === '')
      return true

    return vm.search.type === project.type
  }

  function getSites () {
    vm.isLoading = true
    return siteService.getSites()
      .then(function (response) {
        vm.sites = response
        vm.isLoading = false
      })
  }

  function getSitesPerUser () {
    return siteService.getSitesPerUser()
      .then(function (response) {
        vm.sitesPerUser = response
      })
  }

  function getAllOrganizationalCenters () {
    siteService.getAllOrganizationalCenters()
      .then(function (response) {
        vm.organizationalCenters = response.data
        vm.organizationalCenters.push({
          'shortName': '',
          'displayName': 'Alle'
        })
      })
  }

  function deleteSiteDialog (project, event) {
    $mdDialog.show({
      controller: ['$scope', 'project', function ($scope, project) {
        $scope.project = project
      }],
      template: deleteProjectTemplate,
      locals: {
        project: project
      },
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function createSiteDialog (ev, type) {
    $mdDialog.show({
      template: siteCreateTemplate,
      controller: 'SiteCreateController',
      controllerAs: 'vm',
      locals: {
        sitetype: type
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
  }

  function deleteSite (siteName) {
    siteService.delete(siteName)
      .then(function () {
        getSites()
        getSitesPerUser()
        $mdDialog.cancel()
      })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function openMenu ($mdOpenMenu, event) {
    $mdOpenMenu(event)
  }

  function toggleFilters () {
    vm.showFilters = !vm.showFilters
    $interval(function () {}, 1, 1000)
  }

  function renameSiteDialog (event, shortName, title, description) {
    vm.currentDialogTitle = title
    vm.currentDialogDescription = description
    vm.currentDialogShortName = shortName
    $mdDialog.show({
      template: updateSiteTemplate,
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function searchPeople (query) {
    if (query)
      return MemberService.search(query)
  }

  function infoSiteDialog (site) {
    vm.currentDialogSite = site
    $mdDialog.show({
      template: siteInfoTemplate,
      parent: angular.element(document.body),
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function toggleFavourite (node) {
    var nodeId = alfrescoNodeService.processNodeRef(node.nodeRef).id
    if (node.isFavourite)
      siteService.removeFavourite(nodeId)
        .then(function () {
          node.isFavourite = false
        })
    else
      siteService.addFavourite(nodeId)
        .then(function () {
          node.isFavourite = true
        })
  }

  function getFavouriteIcon (isFavourite) {
    return isFavourite ? 'star' : 'star_border'
  }
}
