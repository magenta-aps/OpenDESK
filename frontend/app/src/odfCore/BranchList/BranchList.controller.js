'use strict'

angular
        .module('openDeskApp.odf')
        .controller('BranchListController', ['$scope', '$state', 'odfCoreService', BranchListController])

function BranchListController($scope, $state, odfCoreService) {
    var vm = this
    vm.addBranch = addBranch
    vm.openBranch = openBranch
    vm.selected = 'fee444dd-422b-49a2-a654-18e165947030'
    vm.branches = []
    
    activate()

    function activate() {
        odfCoreService.getBranches()
            .then(function (response) {
                vm.branches = response
            })
    }
    
    function addBranch(branchTitle){
        odfCoreService.addBranch(branchTitle)
           .then(function(response){
            activate()
            console.log(response)
        })
    }
    
    function openBranch(nodeID) {
        $state.go('branchList.detail', {nodeID: nodeID})
        vm.selected = nodeID
    }

}