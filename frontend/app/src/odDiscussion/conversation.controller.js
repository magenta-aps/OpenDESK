//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import replyTemplate from './view/reply.tmpl.html'
import editTemplate from './view/edit.tmpl.html'
import editFirstPostTemplate from './view/editFirstPost.tmpl.html'

angular
  .module('openDeskApp.discussion')
  .controller('ConversationController', ['$stateParams', '$mdDialog', '$timeout', '$location', '$anchorScroll', '$scope', 'discussionService', ConversationController])

function ConversationController ($stateParams, $mdDialog, $timeout, $location, $anchorScroll, $scope, discussionService) {
  var vm = this

  vm.selectedDiscussion = {}
  vm.replies = []
  vm.permissions = []

  vm.getReplies = getReplies
  vm.replyDialog = replyDialog
  vm.editReplyDialog = editReplyDialog
  vm.editFirstPostDialog = editFirstPostDialog
  vm.deleteDiscussion = deleteDiscussion

  // sets the margin to the width of sidenav
  var tableHeight = $(window).height() - 300 - $('header').outerHeight() - $('md-tabs-wrapper').outerHeight()
  $('.od-discussion').css('max-height', tableHeight + 'px')

  vm.$onInit = function () {
    activate()
  }

  function activate () {
    if ($stateParams.projekt) {
      // @TODO: How does the notion of sites correllate with the foundation module?
      // Can we specify a site short name for this, and get "site" user permissions?
      discussionService.getSiteUserPermissions($stateParams.projekt)
      .then(function (response) {
        vm.permissions = response
      })
    }

    discussionService.getDiscussionFromNodeRef(vm.siteShortName, vm.discussionId)
      .then(function (discussion) {
        $scope.$emit('getDiscussion', discussion) // communicate the discussion to the parent
        vm.selectedDiscussion = discussion
        vm.getReplies(vm.selectedDiscussion)
      })
  }

  function getReplies (postItem) {
    vm.replies = ''
    discussionService.getReplies(postItem).then(function (response) {
      vm.replies = response

      $timeout(function () {
        if ($location.hash())
          $anchorScroll()
      })
    })
  }

  function replyDialog () {
    $mdDialog.show({
      template: replyTemplate,
      controller: 'ModalController',
      controllerAs: 'modalVm',
      locals: {
        postItem: '',
        discussion: vm.selectedDiscussion,
        siteShortName: null
      },
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
    .then(function () {
      vm.getReplies(vm.selectedDiscussion)
    })
  }

  function editReplyDialog (postItem) {
    $mdDialog.show({
      controller: 'ModalController',
      controllerAs: 'modalVm',
      locals: {
        postItem: postItem,
        discussion: null,
        siteShortName: null
      },
      template: editTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
    .then(function () {
      vm.getReplies(vm.selectedDiscussion)
    })
  }

  function editFirstPostDialog (postItem) {
    $mdDialog.show({
      controller: 'ModalController',
      controllerAs: 'modalVm',
      locals: {
        postItem: postItem,
        discussion: null,
        siteShortName: null
      },
      template: editFirstPostTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
    .then(function (content) {
      vm.selectedDiscussion.content = content
    })
  }

  function deleteDiscussion (postItem) {
    discussionService.deletePost(postItem).then(function (response) {
      activate()
    })
  }
}
