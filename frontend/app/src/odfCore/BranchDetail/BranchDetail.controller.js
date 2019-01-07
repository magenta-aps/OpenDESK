'use strict'

angular
        .module('openDeskApp.odf')
        .controller('BranchDetailController', ['$scope', '$stateParams', 'odfCoreService', BranchDetailController])

function BranchDetailController($scope, $stateParams, odfCoreService) {
    var vm = this
    vm.branch = {}
    
    activate()


    function activate() {
        var id = $stateParams.nodeID
        odfCoreService.getBranch(id)
            .then(function (response) {
                vm.branch = response
            })
    }
    
}