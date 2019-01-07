'use strict'

angular
        .module('openDeskApp.odf')
        .controller('NewApplicationsOverviewController', ['$scope', '$state', '$stateParams', 'odfCoreService', NewApplicationsOverviewController])

function NewApplicationsOverviewController($scope, $state, $stateParams, odfCoreService) {
    var vm = this
    vm.openApplication = openApplication
    vm.applications = []
    vm.currentApplication = {}
    
    activate()


    function activate() {
        odfCoreService.getNewApplications()
            .then(function (response) {
                vm.applications = response
            console.log(response)
        })
            
    }
    
    function openApplication(applicationID) {
        console.log("Change application "+applicationID)
        odfCoreService.getApplication(applicationID)
            .then(function (response) {
                vm.currentApplication = response
            console.log(response)
        })
        //$state.go('odf.applicationDetail', {applicationID: applicationID, workflowID: vm.workflow.nodeID, stateID: vm.state.nodeID})
    }
    
    
}