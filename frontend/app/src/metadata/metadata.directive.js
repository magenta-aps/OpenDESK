// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import editTemplate from './view/edit.html'
import viewTemplate from './view/view.html'

angular
  .module('openDeskApp.metadata')
  .directive('odEditMetadata', function () {
    return {
      restrict: 'E',
      scope: {
        node: '<'
      },
      template: editTemplate,
      controller: 'MetadataController',
      controllerAs: 'MC'
    }
  })
  .directive('odViewMetadata', function () {
    return {
      restrict: 'E',
      scope: {
        node: '<'
      },
      template: viewTemplate,
      controller: 'MetadataController',
      controllerAs: 'MC'
    }
  })
