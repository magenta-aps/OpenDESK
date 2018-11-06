import '../shared/services/page.service'

angular
  .module('openDeskApp.systemsettings')
  .controller('SystemSettingsController', ['documentService', 'sessionService', 'pageService', 'systemSettingsService', '$scope',
    'browserService', '$translate', 'APP_BACKEND_CONFIG', SystemSettingsCtrl])

function SystemSettingsCtrl (documentService, sessionService, pageService, systemSettingsService, $scope,
  browserService, $translate, APP_BACKEND_CONFIG) {
  var vm = this

  vm.pages = []
  pageService.addSystemPage(vm.pages, 'Konfiguration', 'systemsettings.config', true, 'settings')
  pageService.addSystemPage(vm.pages, 'Systemgrupper', 'systemsettings.groups', true, 'group')
  if (APP_BACKEND_CONFIG.enableProjects)
    pageService.addSystemPage(vm.pages, 'Projektskabeloner', 'systemsettings.templateList', true)

  documentService.getTemplateFolders()
    .then(
      function (templateFolders) {
        addSystemFolderPage('Tekstskabeloner', templateFolders['document-templates'])
        addSystemFolderPage('Mappeskabeloner', templateFolders['folder-templates'])
        addSystemFolderPage('Dokumentskabeloner', templateFolders['text-templates'])
        addSystemFolderPage('Systemmapper', '', 'folder')
      })

  browserService.setTitle($translate.instant('ADMIN.ADMINISTRATION_PAGES'))

  vm.isAdmin = sessionService.isAdmin()

  function addSystemFolderPage (name, nodeId, icon) {
    pageService.addSystemPage(vm.pages, name, `systemsettings.filebrowser({nodeRef: "${nodeId}"})`, true, icon)
  }
}
