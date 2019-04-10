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
    .controller('FundApplicationHistoryController', ['$scope', 'fundService', '$stateParams', FundApplicationHistoryController])

function FundApplicationHistoryController ($scope, fundService, $stateParams) {
    var vm = this
    vm.appChangeList = []
    activate()
    function activate() {
        // If application is not loaded yet, load it and get its history.
        if (!$scope.$parent.application) {
            fundService.getApplication($stateParams.applicationID)
                .then(function (response) {
                    $scope.$parent.application = response
                    return response
                })
                .then(function (response) {
                    return fundService.getHistory(response.nodeID)
                })
                .then(function (response) {
                    vm.appChangeList = response
                })
        } else {
            fundService.getHistory($scope.$parent.application.nodeID)
                .then(function (response) {
                    vm.appChangeList = response
                })
        }
    }

    //TODO: Should depend on language
    vm.convertTimeStamp = function (ts) {
        ts = ts.split(/[-T:\.]+/)
        console.log(ts)
        return ts[2] + "-" + ts[1] + "-" + ts[0] + " " + ts[3] + ":" + ts[4]
    }
}