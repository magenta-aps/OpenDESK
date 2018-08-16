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
