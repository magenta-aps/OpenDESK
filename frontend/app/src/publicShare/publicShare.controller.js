// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/content.service'
import '../shared/services/document/preview/preview.service'

angular.module('openDeskApp.publicShare')
  .controller('PublicShareController', ['$stateParams', 'documentPreviewService', 'publicShareService',
    PublicShareController])

function PublicShareController ($stateParams, documentPreviewService, publicShareService) {
  var vm = this

  activate()

  function activate () {
    vm.sharedId = $stateParams.sharedId
    getDocument()
  }

  function getDocument () {
    publicShareService.getShared(vm.sharedId)
      .then(
        function (item) {
          console.log("hvad er item");
          console.log(item)


           documentPreviewService.getPluginByNodeRef(response.data.nodeRef)

                      .then(function (plugin) {
                      console.log("hvad er plugin");
                       console.log(plugin);
                        vm.plugin = plugin
                      })


//          vm.plugin = documentPreviewService.getPlugin(item)
//
//          vm.plugin.height = '100%'
//          vm.plugin.sharedId = vm.sharedId
        },
        function (error) {
          if (error.status.code === 404)
            vm.notFound = true
        })
  }
}
