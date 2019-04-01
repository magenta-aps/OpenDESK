//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import text from '../fields/text.html'

angular
  .module('openDeskApp.fund')
  .controller('ApplicationBlockController', ['$scope', '$templateRequest', ApplicationBlockController])

function ApplicationBlockController ($scope, $templateRequest) {
  var vm = this

  vm.toggleExpand = $scope.$parent.vm.toggleExpand
}
