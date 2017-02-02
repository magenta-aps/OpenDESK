'use strict';
angular
    .module('openDeskApp.lool')
    .controller('LoolController', LoolController);

/**
 * Main Controller for the LibreOffice online module module
 * @param $scope
 * @constructor
 */
function LoolController($stateParams) {
    var vm = this;

    var nodeRef = $stateParams.nodeRef;
    console.log('Got the nodeRef on edit page: ' + nodeRef);

}

