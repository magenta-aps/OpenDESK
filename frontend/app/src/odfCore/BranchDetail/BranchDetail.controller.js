'use strict'

angular
        .module('openDeskApp.odf')
        .controller('BranchDetailController', ['$scope', '$stateParams', 'odfCoreService', BranchDetailController])

function BranchDetailController($scope, $stateParams, odfCoreService) {
    var vm = this
    vm.branch = {}
    
    activate()
    
    $scope.$watch()('nodeID', function(val) {
        activate ()
    })

    function activate() {
        console.log($scope.nodeID)
        var id = $scope.nodeID || $stateParams.nodeID
        if(!id) return
        
        odfCoreService.getBranch(id)
            .then(function (response) {
                vm.branch = response
            })
    }
    
}