'use strict'

angular
        .module('openDeskApp.odf')
        .controller('BranchListController', ['$scope', '$state', 'odfCoreService', BranchListController])

function BranchListController($scope, $state, odfCoreService) {
    var vm = this
    vm.addBranch = addBranch
    vm.openWorkflow = openWorkflow
    vm.resetDemoData = resetDemoData
    vm.openIncomming = openIncomming
    vm.workflows = []
    
    activate()

    function activate() {
        odfCoreService.getActiveWorkflows()
            .then(function (response) {
                vm.workflows = response
            })
    }
    
    function addBranch(branchTitle){
        odfCoreService.addBranch(branchTitle)
           .then(function(response){
            activate()
        })
    }
    
    function resetDemoData(){
        odfCoreService.resetDemoData()
           .then(function(response){
            activate()
        })
    }
    
    function openWorkflow(workflowID) {
        $state.go('odf.workflowOverview', {workflowID: workflowID})
    }
    
    function openIncomming() {
        $state.go('odf.newApplications')
    }

}