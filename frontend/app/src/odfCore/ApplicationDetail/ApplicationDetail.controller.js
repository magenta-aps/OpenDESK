'use strict'

angular
        .module('openDeskApp.odf')
        .controller('ApplicationDetailController', ['$scope', '$stateParams', '$state', 'odfCoreService', ApplicationDetailController])

function ApplicationDetailController($scope, $stateParams, $state, odfCoreService) {
    var vm = this
    vm.application = {}
    vm.returnWorkflowID = null
    vm.returnStateID = null
    
    vm.openOverview = openOverview
    
    
    activate()

    function activate() {
        var applicationID = $stateParams.applicationID
        vm.returnWorkflowID = $stateParams.workflowID
        vm.returnStateID = $stateParams.stateID
        console.log(applicationID + ' ' + vm.returnWorkflowID + ' ' +vm.returnStateID)
        odfCoreService.getApplication(applicationID)
            .then(function (response) {
                vm.application = response
                console.log(response)
            })
    }
    
    function openOverview() {
        if(vm.returnStateID){
            console.log("Return to overview with state "+vm.returnStateID)
            $state.go('odf.workflowOverview', {stateID: vm.returnStateID, workflowID: vm.returnWorkflowID})
        }else{
            console.log("Return to unset overview")
            $state.go('odf.workflowOverview', {workflowID: vm.returnWorkflowID})
        }
        
    }
    
   

}