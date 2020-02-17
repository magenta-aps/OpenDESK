// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import forgotPasswordDialogTemplate from './view/forgotPasswordDialog.html'

angular
  .module('openDeskApp')
  .controller('AuthController', ['$state', '$stateParams', 'authService', '$mdDialog', 'sessionService', '$window',
    'notificationsService', AuthController])

function AuthController ($state, $stateParams, authService, $mdDialog, sessionService, $window, notificationsService) {
  var vm = this
  var loginErrorMessage = angular.fromJson($stateParams.error)

  vm.errorMsg = loginErrorMessage || ''
  vm.login = login
  vm.logout = logout
  vm.showForgotDialog = showForgotDialog
  vm.updateValidator = updateValidator
  vm.redirectUrl = $stateParams.redirectUrl

  function login (credentials) {
    authService.login(credentials).then(function (response) {
      // Logged in
      if (response.userName) {
        // chatService.initialize()
        // chatService.login(credentials.username, credentials.password)
        vm.user = response
        restoreLocation(vm.redirectUrl)
      }

      // If incorrect values
      if (response.status === 403)
        vm.form.password.$setValidity('loginFailure', false)
      else if (response.status === 500)
        vm.form.password.$setValidity('loginError', false)
    })
  }

  function logout () {
    // chatService.logout()
    authService.logout()
    notificationsService.stopUpdate()
  }

  function showForgotDialog (ev) {
    $mdDialog.show({
      controller: forgotPasswordCtrl,
      controllerAs: 'dlg',
      template: forgotPasswordDialogTemplate,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
  }

  function updateValidator () {
    if (vm.form.password.$error.loginFailure)
      vm.form.password.$setValidity('loginFailure', true)
  }

  function restoreLocation (retainedLocation) {
    var retainedLocation = sessionService.getRetainedLocation()
    if (!retainedLocation || retainedLocation === undefined)
      $state.go('dashboard')
    else
      $window.location = retainedLocation
    sessionService.clearRetainedLocation()
  }

  function forgotPasswordCtrl ($scope, $mdDialog) {
    var dlg = this
    dlg.emailSent = false

    dlg.cancel = function () {
      return $mdDialog.cancel()
    }

    dlg.updateValidators = function () {
      if (dlg.form.email.$error.emailNotExists)
        dlg.form.email.$setValidity('emailNotExists', true)
    }

    dlg.forgotPassword = function () {
      if (!dlg.email) return

      authService.changePassword(dlg.email)
        .then(function success () {
          dlg.emailSent = true
        },

        function onError (response) {
          // If email doesn't exist in system
          if (response.status !== 200)
            dlg.form.email.$setValidity('emailNotExists', false)
        }
        )
    }
  }
}
