//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('ToastController', ['$mdToast', '$scope', '$state', 'appId', ToastController])

function ToastController($mdToast, $scope, $state, appId) {
    var ctrl = this
    ctrl.closeToast = closeToast
    ctrl.goToApplication = goToApplication

    function closeToast () {
      $mdToast.hide()
    }

    function goToApplication () {
      $state.go('fund.application', {applicationID: appId}) //workflowID and stateID are left out in the request.
    }
}
