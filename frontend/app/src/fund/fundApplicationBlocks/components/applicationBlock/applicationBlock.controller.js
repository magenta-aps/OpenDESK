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
  .controller('ApplicationBlockController', ['$scope', ApplicationBlockController])

function ApplicationBlockController ($scope) {
  var vm = this

  vm.phoneNumber = null
  vm.amount = null

  $scope.$on('applicationWasLoaded', function () {
    vm.phoneNumber = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.describes == 'phone_number') : {}
    vm.amount = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.describes == 'amount') : {}
  })
}
