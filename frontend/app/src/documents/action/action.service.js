//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

angular
  .module('openDeskApp.documents')
  .provider('documentActionService', documentActionServiceProvider)

function documentActionServiceProvider () {
  var actions = []

  this.addAction = addAction
  this.$get = documentActionService

  /**
   *
   * @param icon - icon to be displayed
   * @param labelKey - key for translation
   * @param serviceName - for injector
   * @returns {documentActionServiceProvider}
   */
  function addAction (icon, labelKey, serviceName) {
    actions.push({
      icon: icon,
      labelKey: labelKey,
      serviceName: serviceName
    })
    return this
  }

  function documentActionService () {
    return {
      getActions: getActions
    }

    function getActions () {
      return actions
    }
  }

}
