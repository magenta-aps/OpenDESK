'use strict'

import 'ng-ckeditor'
import overviewTemplate from './view/overview.html'
import conversationTemplate from './view/conversation.html'

angular.module('openDeskApp.discussion', ['ng.ckeditor'])
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
          controller: 'DiscussionController',
          controllerAs: 'vm'
        }
      }
    })
}
