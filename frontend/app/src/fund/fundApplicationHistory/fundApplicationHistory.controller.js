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
    .controller('FundApplicationHistoryController', ['$scope', 'fundService', FundApplicationHistoryController])

function FundApplicationHistoryController ($scope, fundService, $rootScope) {
    var vm = this
    vm.changes = []
    $scope.$on('applicationWasLoaded', function (event, application) {
        fundService.getHistory(application.nodeID)
            .then(function (response) {
                console.log('Got response')
                vm.changes = response
            })
    })
}
