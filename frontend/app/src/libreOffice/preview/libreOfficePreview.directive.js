// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import libreOfficeTemplate from '../view/libreOffice.html'

angular
  .module('openDeskApp.libreOffice')
  .directive('libreOffice', function () {
    return {
      restrict: 'E',
      scope: {
        nodeRef: '=nodeRef'
      },
      template: libreOfficeTemplate,
      controller: 'LibreOfficePreviewController',
      controllerAs: 'LC'
    }
  })
