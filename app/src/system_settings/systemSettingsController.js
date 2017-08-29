angular
    .module('openDeskApp.systemsettings')
    .controller('SystemSettingsController', SystemSettingsCtrl);

function SystemSettingsCtrl(sessionService, pageService, systemSettingsService, $scope,
                            browserService, $translate, APP_CONFIG) {
    var vm = this;

    vm.pages = [];
    if(APP_CONFIG.settings.enableProjects)
        pageService.addSystemPage(vm.pages, 'Projektskabeloner', 'systemsettings.templateList', true);
    pageService.addSystemPage(vm.pages, 'Mappeskabeloner', 'systemsettings.folder_templates', true);
    pageService.addSystemPage(vm.pages, 'Dokumentskabeloner', 'systemsettings.document_templates', true);
    pageService.addSystemPage(vm.pages, 'Systemmapper', 'systemsettings.filebrowser({path: ""})', true);

    browserService.setTitle($translate.instant('ADMIN.ADMINISTRATION_PAGES'));

    $scope.templateSites = [];

    function loadTemplates() {
        systemSettingsService.getTemplates().then (function(response) {
            $scope.templateSites = response;
        });
    }
    loadTemplates();

    vm.isAdmin = sessionService.isAdmin();
}