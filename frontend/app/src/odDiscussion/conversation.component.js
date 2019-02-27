//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import conversationTemplate from './view/conversation.html'

angular.module('openDeskApp.discussion')
  .component('conversation', {
    template: conversationTemplate,
    controller: 'ConversationController',
    controllerAs: 'vm',
    bindings: {
      discussionId: '<',
      siteShortName: '<'
    }
  })
