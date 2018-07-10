angular
  .module('openDeskApp.systemsettings')
  .controller('SystemSettingsController', SystemSettingsCtrl)

function SystemSettingsCtrl (sessionService, pageService, systemSettingsService, $scope,
  browserService, $translate, APP_BACKEND_CONFIG) {
  var vm = this

  vm.pages = []
  pageService.addSystemPage(vm.pages, 'Konfiguration', 'systemsettings.config', true, 'settings')
  pageService.addSystemPage(vm.pages, 'Systemgrupper', 'systemsettings.groups', true, 'group')
  if (APP_BACKEND_CONFIG.enableProjects)
    pageService.addSystemPage(vm.pages, 'Projektskabeloner', 'systemsettings.templateList', true)
  pageService.addSystemPage(vm.pages, 'Tekstskabeloner', 'systemsettings.filebrowser({path: "/Data Dictionary/Web Scripts Extensions/OpenDesk/Templates"})', true)
  pageService.addSystemPage(vm.pages, 'Mappeskabeloner', 'systemsettings.filebrowser({path: "/Data Dictionary/Space Templates"})', true)
  pageService.addSystemPage(vm.pages, 'Dokumentskabeloner', 'systemsettings.filebrowser({path: "/Data Dictionary/Node Templates"})', true)
  pageService.addSystemPage(vm.pages, 'Systemmapper', 'systemsettings.filebrowser({path: ""})', true, 'folder')

  browserService.setTitle($translate.instant('ADMIN.ADMINISTRATION_PAGES'))

  $scope.templateSites = []

  function loadTemplates () {
    systemSettingsService.getTemplates()
      .then(function (response) {
        $scope.templateSites = response
      })
  }
  loadTemplates()

  vm.isAdmin = sessionService.isAdmin()
}
