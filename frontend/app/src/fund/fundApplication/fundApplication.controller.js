//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import * as data from './application.json'

angular
  .module('openDeskApp.fund')
  .controller('FundApplicationController', ['$scope', '$stateParams', FundApplicationController])

function FundApplicationController ($scope, $stateParams) {
  $scope.id = $stateParams.id
  $scope.application = data.default
  $scope.currentAppPage = $stateParams.currentAppPage || 'application'
}
