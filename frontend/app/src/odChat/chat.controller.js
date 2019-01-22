// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import chatTemplate from './view/chat.html'

angular
  .module('openDeskApp.chat')
  .controller('ChatController', ['chatService', 'APP_BACKEND_CONFIG', ChatController])
  .directive('odChat', function () {
    return {
      restrict: 'E',
      scope: {},
      template: chatTemplate
    }
  })

function ChatController (chatService, APP_BACKEND_CONFIG) {
  if (APP_BACKEND_CONFIG.enableChat)
    chatService.initialize()
}
