'use strict'

import '../components/ckEditor'
import '../shared/filters/customDateFilter'
import '../shared/directives/breadcrumb'
import overviewTemplate from './view/overview.html'
import conversationTemplate from './view/conversation.html'
import newDiscussion from './view/newThread.tmpl.html'

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
      url: '/diskussioner/{path:SlashFix}',
      params: {
        selectedTab: 1
      },
      views: {
        'discussions': {
          template: conversationTemplate,
          controller: 'DiscussionDetailController',
          controllerAs: 'vm'
        }
      }
    })
    .state('project.new-discussion', {
      url: '/ny',
      views: {
        'discussions': {
          template: newDiscussion
          // controller: 'DiscussionController',
          // controllerAs: 'vm'
        }
      }
    })
}
