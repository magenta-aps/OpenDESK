// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('FilebrowserRowController', ['$stateParams', '$window', FilebrowserRowController])

function FilebrowserRowController ($stateParams, $window) {
  var vm = this

  vm.getUiRef = getUiRef
  vm.scrollToFilebrowserTop = scrollToFilebrowserTop

  function getUiRef (content) {
    if (content.contentType === 'cmis:document')
      if ($stateParams.type === 'system-folders' && content.mimeType && content.mimeType === 'text/html')
        return 'systemsettings.text_template_edit({doc: "' + content.shortRef + '"})'
      else
        return 'document({doc: "' + content.shortRef + '"})'

    if (content.contentType === 'cmis:folder') {
      if ($stateParams.type === 'system-folders')
        return 'systemsettings.filebrowser({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'my-docs')
        return 'odDocuments.myDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'shared-docs')
        return 'odDocuments.sharedDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'site')
        return 'project.filebrowser({nodeRef: "' + content.shortRef + '"})'
    }

    if (content.contentType === 'cmis:link')
      return 'project({projekt: "' + content.destination_link + '"})'
  }

  function scrollToFilebrowserTop() {
    $window.scrollTo(0, 0);
  }
}
