// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import nodePickerTemplate from './nodePicker.view.html'

angular
  .module('openDeskApp')
  .directive('nodePicker', function () {
    return {
      restrict: 'E',
      scope: {
        currentNodeRef: '=root',
        selectedNode: '=model'
      },
      template: nodePickerTemplate,
      controller: 'NodePickerController',
      controllerAs: 'vm'
    }
  })
