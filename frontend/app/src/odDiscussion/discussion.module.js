// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

import '../components/ckEditor'
import '../shared/filters/customDateFilter'
import '../shared/directives/breadcrumb'
import overviewTemplate from './view/overview.html'
import conversationTemplate from './view/conversation.html'

angular.module('openDeskApp.discussion', ['ckEditor'])
  .config(['$stateProvider', config])

function config ($stateProvider) {
  $stateProvider.state('project.discussions', {
    url: '/diskussioner',
    params: {
      selectedTab: 1
    },
    views: {
      'discussions': {
        template: overviewTemplate,
        controller: 'DiscussionController',
        controllerAs: 'vm'
      }
    }
  })
    .state('project.viewthread', {
      url: '/diskussioner/{discussion:SlashFix}',
      params: {
        selectedTab: 1
      },
      views: {
        'discussions': {
          template: conversationTemplate,
          controller: 'DiscussionController',
          controllerAs: 'vm'
        }
      }
    })
}
