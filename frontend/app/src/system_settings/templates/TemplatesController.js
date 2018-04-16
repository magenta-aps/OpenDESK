'use strict';

angular
    .module('openDeskApp')
    .controller('TemplatesController', TemplatesController);

function TemplatesController(siteService, $mdDialog, $scope, $translate, systemSettingsService) {
    var vm = this;

    vm.createTemplate = createTemplate;
    vm.newTemplate = newTemplate;
    vm.deleteSite = deleteSite;
    vm.deleteSiteDialog = deleteSiteDialog;
    
    function createTemplate(name, description) {
           siteService.createTemplate(name, description).then (function (response) {
               $scope.templateSites.push(response[0]);
               $mdDialog.hide();
           });
    }

    
    function newTemplate(event) {
        $mdDialog.show({
            templateUrl: 'app/src/system_settings/templates/view/newTemplate.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            targetEvent: event,
            clickOutsideToClose:true
        });
    }


    function deleteSite(shortName) {
        return siteService.deleteSite(shortName);
    }

    
    function deleteSiteDialog(siteName) {
        var confirm = $mdDialog.confirm()
            .title('Vil du slette denne skabelon?')
            .textContent('Skabelonen og alle dets filer vil blive slettet')
            .ok('Ja')
            .cancel('Annullér');
            
        $mdDialog.show(confirm).then(
            function() {
                vm.deleteSite(siteName).then (function(response){

                    console.log("hvad er $scope.templateSites");
                    console.log($scope.templateSites.length);

                    systemSettingsService.getTemplates().then (function(response) {
                        console.log(response);

                        $scope.templateSites = response;
                        $mdDialog.hide();

                        console.log("hvad er $scope.templateSites");
                        console.log($scope.templateSites.length);
                    });
                });
            },
            function() {
                console.log('cancelled delete');
            }
        );
    }
}