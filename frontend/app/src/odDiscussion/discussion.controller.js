// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/nodeRefUtils.service'
import replyTemplate from './view/reply.tmpl.html'
import newThreadTemplate from './view/newThread.tmpl.html'
import editTemplate from './view/edit.tmpl.html'
import editFirstPostTemplate from './view/editFirstPost.tmpl.html'
import editTitleTemplate from './view/editTitle.tmpl.html'

angular
  .module('openDeskApp.discussion')
  .controller('DiscussionController', ['APP_CONFIG', '$scope', '$timeout', '$mdDialog', '$state', '$stateParams',
    '$interval', '$anchorScroll', '$location', 'discussionService', 'nodeRefUtilsService', 'siteService',
    'userService', DiscussionController])

function DiscussionController (APP_CONFIG, $scope, $timeout, $mdDialog, $state, $stateParams, $interval, $anchorScroll,
  $location, discussionService, nodeRefUtilsService, siteService, userService) {
  var vm = this

  vm.discussions = []
  vm.permissions = []
  vm.replies = []
  vm.search = ''
  vm.user = userService.getUser()
  vm.isLoading = true

  vm.cancelDialog = cancelDialog
  vm.changeSubscription = changeSubscription
  vm.deleteDiscussion = deleteDiscussion
  vm.editFirstPost = editFirstPost
  vm.editFirstPostDialog = editFirstPostDialog
  vm.editReply = editReply
  vm.editReplyDialog = editReplyDialog
  vm.editTitleDialog = editTitleDialog
  vm.evaluateFilter = evaluateFilter
  vm.getDiscussions = getDiscussions
  vm.getReplies = getReplies
  vm.newDiscussion = newDiscussion
  vm.newDiscussionDialog = newDiscussionDialog
  vm.reply = reply
  vm.replyDialog = replyDialog
  vm.subscriptionIcon = subscriptionIcon
  vm.viewDiscussions = viewDiscussions
  vm.viewThread = viewThread

  // sets the margin to the width of sidenav
  var tableHeight = $(window).height() - 300 - $('header').outerHeight() - $('md-tabs-wrapper').outerHeight()
  $('.od-discussion').css('max-height', tableHeight + 'px')

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab
    getSiteUserPermissions()

    if ($stateParams.discussion) {
      var nodeId = $stateParams.discussion.split('#')[0]
      discussionService.getDiscussionFromNodeRef($stateParams.projekt, nodeId)
        .then(function (discussion) {
          vm.selectedDiscussion = discussion
          vm.getReplies(vm.selectedDiscussion)
        })
    } else {
      vm.getDiscussions($stateParams.projekt)
    }
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function getDiscussions (siteShortName) {
    vm.isLoading = true
    discussionService.getDiscussions(siteShortName)
      .then(function (response) {
        response.items.forEach(function (item) {
          if (item.lastReplyOn === undefined)
            item.lastReplyOn = item.modifiedOn
        })
        vm.discussions = response.items
        vm.isLoading = false
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

  function getSiteUserPermissions () {
    vm.permissions = siteService.getPermissions()
    if (vm.permissions === undefined)
      siteService.getSiteUserPermissions($stateParams.projekt)
        .then(function (permissions) {
          vm.permissions = permissions
        })
  }

  function replyDialog () {
    $mdDialog.show({
      controller: ['$scope', function ($scope) {
        $scope.changedContent = ''
        $scope.ckEditorCallback = function (value) {
          $scope.changedContent = value
        }
      }],
      template: replyTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
  }

  function reply (content) {
    discussionService.addReply(vm.selectedDiscussion, content).then(function (response) {
      discussionService.subscribeToDiscussion($stateParams.projekt, vm.selectedDiscussion)
      vm.getReplies(vm.selectedDiscussion)
      $mdDialog.cancel()
    })
  }

  function newDiscussionDialog () {
    $mdDialog.show({
      controller: ['$scope', function ($scope) {
        $scope.changedContent = ''
        $scope.ckEditorCallback = function (value) {
          $scope.changedContent = value
        }
      }],
      template: newThreadTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
  }

  function newDiscussion (title, content) {
    discussionService.addDiscussion($stateParams.projekt, title, content).then(function (response) {
      discussionService.subscribeToDiscussion($stateParams.projekt, response.item)
      vm.getDiscussions($stateParams.projekt)
      $mdDialog.cancel()
    })
  }

  function viewThread (postItem) {
    return APP_CONFIG.sitesUrl + '/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef)
  }

  function deleteDiscussion (postItem) {
    discussionService.deletePost(postItem).then(function (response) {
      vm.getDiscussions($stateParams.projekt)
      vm.getReplies(vm.selectedDiscussion)
    })
  }

  function editReply (postItem, content) {
    discussionService.updatePost(postItem, '', content).then(function (response) {
      $mdDialog.cancel()
      vm.getReplies(vm.selectedDiscussion)
    })
  }

  function editReplyDialog (postItem) {
    $mdDialog.show({
      controller: ['$scope', 'postItem', function ($scope, postItem) {
        $scope.postItem = postItem
        $scope.changedContent = postItem
        $scope.ckEditorCallback = function (value) {
          $scope.changedContent = value
        }
      }],
      locals: {
        postItem: postItem
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
  }

  function editFirstPost (postItem, title, content) {
    discussionService.updatePost(postItem, title, content).then(function () {
      $mdDialog.cancel()
      vm.selectedDiscussion.content = content
    })
  }

  function editFirstPostDialog (postItem) {
    $mdDialog.show({
      controller: ['$scope', 'postItem', function ($scope, postItem) {
        $scope.postItem = postItem
        $scope.changedContent = postItem
        $scope.ckEditorCallback = function (value) {
          $scope.changedContent = value
        }
      }],
      locals: {
        postItem: postItem
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
  }

  function editTitleDialog (postItem) {
    $mdDialog.show({
      controller: ['$scope', 'postItem', function ($scope, postItem) {
        $scope.postItem = postItem
      }],
      locals: {
        postItem: postItem
      },
      template: editTitleTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function viewDiscussions () {
    $state.go('project.discussions')
  }

  function evaluateFilter () {
    if (vm.search === 'all') {
      vm.searchSubscribed = undefined
      vm.searchUser = undefined
    }
    if (vm.search === 'follow') {
      vm.searchUser = undefined
      vm.searchSubscribed = 'true'
    }

    if (vm.search === 'mine') {
      vm.searchSubscribed = undefined
      vm.searchUser = vm.user.userName
    }

    $interval(function () {}, 1, 1000)
  }

  function changeSubscription (postItem) {
    postItem.isSubscribed = !postItem.isSubscribed

    if (postItem.isSubscribed)
      discussionService.subscribeToDiscussion($stateParams.projekt, postItem)
    else
      discussionService.unSubscribeToDiscussion($stateParams.projekt, postItem)
  }

  function subscriptionIcon (value) {
    return String(value) === 'true' ? 'notifications_active' : 'notifications_none'
  }
}
