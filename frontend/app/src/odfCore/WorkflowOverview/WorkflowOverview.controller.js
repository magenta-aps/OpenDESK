'use strict'

angular
        .module('openDeskApp.odf')
        .controller('WorkflowOverviewController', ['$scope', '$state', '$stateParams', 'odfCoreService', WorkflowOverviewController])

function WorkflowOverviewController($scope, $state, $stateParams, odfCoreService) {
    var vm = this
    vm.openState = openState
    vm.openApplication = openApplication
    vm.workflow = {}
    vm.state = {}
    
    activate()


    function activate() {
        var id = $stateParams.workflowID
        var stateID = $stateParams.stateID
        odfCoreService.getWorkflow(id)
            .then(function (response) {
                vm.workflow = response
        console.log(response)
            })
        if(stateID){
            openState(stateID)
        }
            
    }
    
    function openState(stateID) {
        odfCoreService.getWorkflowState(stateID)
            .then(function (response) {
                vm.state = response
            })
    }
    
    function openApplication(applicationID) {
        console.log("Change state "+applicationID)
        $state.go('odf.applicationDetail', {applicationID: applicationID, workflowID: vm.workflow.nodeID, stateID: vm.state.nodeID})
    }
    
    
}