//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

angular
  .module('openDeskApp')
  .config(['$mdThemingProvider', config])
  .factory('toastService', ['$mdToast', '$translate', toastService])

function config ($mdThemingProvider) {
  $mdThemingProvider.theme('success-toast')
  $mdThemingProvider.theme('error-toast')
}

function toastService ($mdToast, $translate) {
  var service = {
    notify: notify,
    notifyError: notifyError,
    alert: alert
  }

  var defaultToastPosition = 'bottom left'
  var defaultAlertToastPosition = 'bottom left'

  return service

  function notify (message, toastPosition) {
    if (typeof toastPosition === 'undefined')
      toastPosition = defaultToastPosition

    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position(toastPosition)
        .hideDelay(3000)
        .theme('success-toast')
    )
  }

  function notifyError (message, toastPosition) {
    if (typeof toastPosition === 'undefined')
      toastPosition = defaultToastPosition

    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position(toastPosition)
        .hideDelay(3000)
        .theme('error-toast')
    )
  }

  function alert (message, toastPosition) {
    if (typeof toastPosition === 'undefined')
      toastPosition = defaultAlertToastPosition

    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .action($translate.instant('COMMON.OK'))
        .highlightAction(true)
        .position(toastPosition)
        .hideDelay(0)
        .theme('error-toast')
    )
  }
}
