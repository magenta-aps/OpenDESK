'use strict'

angular
  .module('openDeskApp.site')
  .controller('SiteCreateController', ['sitetype', '$scope', '$state', '$mdToast', '$translate', '$mdDialog',
    'userService', 'siteService', 'memberService', SiteCreateController])

function SiteCreateController (sitetype, $scope, $state, $mdToast, $translate, $mdDialog, userService, siteService,
  memberService) {
  var vm = this

  var currentUser = userService.get()

  vm.type = sitetype

  vm.cancelDialog = cancelDialog

  vm.newSite = {
    isPrivate: false,
    manager: currentUser,
    presetManager: currentUser
  }

  $scope.selectedProjGrpItem = null
  $scope.srchprjgrptxt = null
  $scope.selectedStyreGrpItem = null
  $scope.srchstrgrptxt = null
  $scope.selectedArbejdsGrpItem = null
  $scope.srchrbjdgrptxt = null
  $scope.selectedFolgeGrpItem = null
  $scope.srchflggrptxt = null

  vm.searchPeople = searchPeople
  vm.createPdSite = createPdSite
  vm.createSite = createSite

  $scope.creating = false

  activate()

  function activate () {
    loadTemplateNames()
    loadSiteGroups()
  }

  $scope.groupFilter = function (group) {
    if (group.multipleMembers)
      return group
  }

  function loadTemplateNames () {
    siteService.getTemplateNames().then(function (templates) {
      $scope.templates = templates
    })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function searchPeople (query) {
    if (query)
      return memberService.findAuthorities(query)
  }

  function loadSiteGroups () {
    siteService.getSiteGroups(vm.type).then(function (response) {
      vm.newSite.groups = response
    })
  }

  function createPdSite () {
    $scope.creating = true
    if (vm.newSite.template === undefined || vm.newSite.template === 'no-template')
      vm.newSite.template = {
        'name': ''
      }

    vm.newSite.visibility = vm.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC'

    siteService.createPDSite(vm.newSite).then(
      function (response) {
        var siteShortName = response.data.shortName
        var siteName = vm.newSite.siteName

        angular.forEach(vm.newSite.groups, function (group) {
          if (group.multipleMembers)
            addUserToGroup(siteShortName, siteName, group.members, group.shortName)
        })

        $mdDialog.cancel()
        $state.go('project', {
          projekt: siteShortName
        })
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har oprettet projekt: ' + $translate.instant('SITES.' + vm.type + '.NAME').toLowerCase() + ' med navnet ' + vm.newSite.siteName)
            .hideDelay(3000)
        )
        $scope.creating = false
      },
      function (err) {
        console.log(err)
        $scope.creating = false
      }
    )
  }

  function createSite () {
    $scope.creating = true
    var visibility = 'PUBLIC' // Visibility is set to public
    if (vm.newSite.isPrivate)
      visibility = 'PRIVATE'

    siteService.createSite(vm.newSite.siteName, vm.newSite.desc, visibility).then(function (response) {
      var siteShortName = response.shortName
      var siteName = vm.newSite.siteName

      angular.forEach(vm.newSite.groups, function (group) {
        if (group.multipleMembers)
          addUserToGroup(siteShortName, siteName, group.members, group.shortName)
      })

      $state.go('project', {
        projekt: siteShortName
      })
      $mdToast.show(
        $mdToast.simple()
          .textContent('Du har oprettet et nyt ' + $translate.instant('SITES.' + vm.type + '.NAME').toLowerCase() + ' med navnet ' + vm.newSite.siteName)
          .hideDelay(3000)
      )
      $scope.creating = false

      $mdDialog.cancel()
    })
  }

  function addUserToGroup (siteShortName, siteName, group, groupName) {
    // Iterating list of items sequential instead of async.
    angular.forEach(group, function (authority) {
      var authorityName = authority.userName ? authority.userName : authority.fullName
      memberService.add(siteShortName, authorityName, groupName)
        .then(function () {
        },
        function (err) {
          console.log('ERROR: Could not add ' + authorityName + ' in site group ' + groupName)
          console.log(err)
        }
        )
    })
  }
}
