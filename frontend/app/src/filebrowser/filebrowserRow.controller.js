'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('FilebrowserRowController', ['$stateParams', FilebrowserRowController])

function FilebrowserRowController ($stateParams) {
  var vm = this

  vm.getUiRef = getUiRef

  function getUiRef (content) {
    if (content.contentType === 'cmis:document')
      if ($stateParams.type === 'system-folders' && content.mimeType === 'text/html')
        return 'systemsettings.text_template_edit({doc: "' + content.shortRef + '"})'
      else
        return 'document({doc: "' + content.shortRef + '"})'

    if (content.contentType === 'cmis:folder')
      if ($stateParams.type === 'system-folders')
        return 'systemsettings.filebrowser({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'my-docs')
        return 'odDocuments.myDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'shared-docs')
        return 'odDocuments.sharedDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'site')
        return 'project.filebrowser({nodeRef: "' + content.shortRef + '"})'

    if (content.contentType === 'cmis:link')
      return 'project({projekt: "' + content.destination_link + '"})'
  }
}
