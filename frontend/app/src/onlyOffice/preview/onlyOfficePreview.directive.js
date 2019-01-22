// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import onlyOfficeTemplate from '../view/onlyOffice.html'

angular
  .module('openDeskApp')
  .directive('onlyOffice', function () {
    return {
      restrict: 'E',
      scope: {
        nodeRef: '=',
        sharedId: '='
      },
      template: onlyOfficeTemplate,
      controller: 'OnlyOfficePreviewController',
      controllerAs: 'vm'
    }
  })
