// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.site')
  .controller('EditSiteMemberController', ['sitedata', '$scope', '$mdDialog', '$mdToast', 'APP_CONFIG', 'siteService',
    'personService', 'userService', EditSiteMemberController])

function EditSiteMemberController (sitedata, $scope, $mdDialog, $mdToast, APP_CONFIG, siteService, personService,
  userService) {
  var vm = this

  $scope.externalUser = {
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    group: ''
  }
  vm.ssoLoginEnabled = APP_CONFIG.ssoLoginEnabled
  vm.addExternalUserToGroup = addExternalUserToGroup
  vm.addMemberToSite = addMemberToSite
  vm.cancelDialog = cancelDialog
  vm.groupFilter = groupFilter
  vm.groups = []
  vm.removeMemberFromSite = removeMemberFromSite
  vm.saveChanges = saveChanges
  vm.searchPeople = searchPeople
  vm.site = sitedata
  vm.user = userService.getUser()
  vm.showSendEmailDialog = showSendEmailDialog

  activate()

  function activate () {
    siteService.getAuthorities(vm.site.shortName).then(function (groups) {
      vm.groups = groups
    })
  }

  function saveChanges () {
    siteService.updateMemberList()
    cancelDialog()
  }

  function groupFilter (group) {
    if (group.multipleMembers)
      return group
  }

  function searchPeople (query) {
    if (query)
      return siteService.findAuthorities(vm.site.shortName, query)
  }

  function addExternalUserToGroup (userName, firstName, lastName, email, telephone, group) {
    personService.validatePerson(userName, email)
      .then(function (response) {
        if (response.isValid) {
          personService.addExternalPerson(vm.site.shortName, userName, firstName, lastName, email, telephone,
            group.shortName).then(
            function (response) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Den eksterne bruger, ' + firstName + ' ' + lastName + ', er blevet oprettet.')
                  .hideDelay(3000)
              )
              $scope.externalUser = {}
              group.members.push({
                firstName: firstName,
                lastName: lastName,
                displayName: firstName + ' ' + lastName,
                email: email
              })
              showSendEmailDialog(response.userName, response.subject, response.body)
            },
            function () {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Brugeren kunne ikke oprettes. Tjek at du ikke bruger nogle specielle karakterer i navnet')
                  .hideDelay(3000)
              )
            }
          )
        } else {
          var msg = 'Brugeren blev ikke valideret.'
          if (response.emailExists)
            msg = 'Emailen er allerede i brug.'
          if (response.userNameExists)
            msg = 'Brugernavnet er allerede i brug.'
          $mdToast.show(
            $mdToast.simple()
              .textContent(msg)
              .hideDelay(3000)
          )
        }
      })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function addMemberToSite (authority, groupName) {
    var authorityName = authority.userName ? authority.userName : authority.fullName
    var siteShortName = vm.site.shortName

    siteService.addMember(siteShortName, authorityName, groupName)
      .then(function () {
        for (var i = 0; i < vm.groups.length; i++) {
          var group = vm.groups[i]
          if (group.shortName === groupName) {
            group.members.push(authority)
            break
          }
        }
      })
  }

  function removeMemberFromSite (authority, groupName) {
    var authorityName = authority.userName ? authority.userName : authority.fullName
    var siteShortName = vm.site.shortName
    siteService.removeMember(siteShortName, authorityName, groupName)
  }

  function showSendEmailDialog (userName, subject, body) {
    var email = {
      userName: userName,
      subject: subject,
      body: body
    }

    $mdDialog.show({
      locals: { email: email },
      controller: ['$scope', 'email', function ($scope, email) {
        $scope.email = email
      }],
      template: '<od-email-send email="email" is-loaded="isLoaded"></od-email-send>',
      onComplete: function (scope) {
        scope.isLoaded = true
      }
    })
  }
}
