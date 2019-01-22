// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import iconPickerTemplate from './iconPicker.view.html'

angular
  .module('openDeskApp')
  .directive('iconPicker', function () {
    return {
      restrict: 'E',
      scope: {
        selectedIcon: '=selectedIcon'
      },
      template: iconPickerTemplate,
      controller: 'IconPickerController',
      controllerAs: 'vm'
    }
  })
