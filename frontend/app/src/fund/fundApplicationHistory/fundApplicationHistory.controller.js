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
    console.log('Found controller')

    fundService.getHistory('067fa75b-4b81-48fc-a64c-429e7ab67410') //Need applicationID. Hardcoded not working either.
        .then(function (response) {
            console.log('Got response')
            vm.changes = response
        })
}
