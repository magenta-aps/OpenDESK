angular
    .module('openDeskApp')
    .controller('TemplatesController', TemplatesController);

function TemplatesController(siteService, $mdDialog, $scope, systemSettingsService) {
    var vm = this;

    function init() {
        
        vm.templateUisref = "administration.systemsettings." + vm.caseType.replace(':', '_') + '_template';

        vm.loadTemplates();
        startCaseWorkflowService.getWorkflowDefinitions().then(function (result) {
            vm.workflowDefs = result;
        });
    }

    function loadTemplates() {
     
        caseTemplatesService.getTemplates(vm.caseType).then(function (templates) {
            vm.templates = templates.map(function (template) {
                template.prefilledProps = vm.getPrefilledProps(template);
                return template;
            });
        });
    }

    function getPrefilledPropName(prop) {
        for (var i = 0; i < vm.propNameKeyPrefixes.length; i++) {
            var prefix = vm.propNameKeyPrefixes[i];
            var propName = $translate.instant(prefix + prop);
            if (propName.indexOf(prefix) == -1) {
                return propName;
            }
        }
        return prop;
    }

    function getWorkflowDisplayName(workflowDefId) {
        for (var i = 0; i < vm.workflowDefs.length; i++) {
            if (workflowDefId == vm.workflowDefs[i].id) {
                return vm.workflowDefs[i].title;
            }
        }
        return workflowDefId;
    }

    function getPrefilledProps(template) {
        var props = [];
        for (var i = 0; i < vm.availableProps.length; i++) {
            var prop = vm.availableProps[i];
            var value = template.properties[prop];
            if (vm.isPropSet(prop, value)) {
                props.push(prop);
            }
        }
        return props;
    }

    function isPropSet(prop, value) {
        if (value === undefined || value === "" || value.value === undefined || value.value === "") {
            return false;
        }
        if (prop == "oe:owners" && value.value[0] == "admin") {
            return false;
        }
        return true;
    }

    vm.createTemplate = function(name, description) {
           siteService.createTemplate(name, description).then (function (response) {
               $scope.templateSites.push(response[0]);
               $mdDialog.hide();
           });
    };

    vm.newTemplate = function(event) {
        $mdDialog.show({
            templateUrl: 'app/src/system_settings/templates/view/newTemplate.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            targetEvent: event,
            clickOutsideToClose:true
        });
    };

    vm.deleteSite = function (shortName) {
        return siteService.deleteSite(shortName);
    }

    vm.deleteSiteDialog = function(siteName) {
        var confirm = $mdDialog.confirm()
            .title('Vil du slette denne skabelon?')
            .textContent('Skabelonen og alle dets filer vil blive slettet')
            .ok('Ja')
            .cancel('Annullér');
            
        $mdDialog.show(confirm).then(
            function() {
                vm.deleteSite(siteName).then (function(response){

                    console.log("hvad er $scope.templateSites")
                    console.log($scope.templateSites.length);

                    systemSettingsService.getTemplates().then (function(response) {

                        console.log(response)

                        $scope.templateSites = response;
                        $mdDialog.hide();

                        console.log("hvad er $scope.templateSites")
                        console.log($scope.templateSites.length);
                    });

                })
            },
            function() {
                console.log('cancelled delete');
            }
        );
    };
}