//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import '../shared/services/nodeRefUtils.service'
import newThreadTemplate from './view/newThread.tmpl.html'
import editTitleTemplate from './view/editTitle.tmpl.html'

angular
  .module('openDeskApp.discussion')
  .controller('OverviewController', ['APP_CONFIG', '$scope', '$mdDialog', '$stateParams',
    '$interval', 'discussionService', 'nodeRefUtilsService', 'userService', OverviewController])

function OverviewController (APP_CONFIG, $scope, $mdDialog, $stateParams, $interval, discussionService, nodeRefUtilsService, userService) {
  var vm = this

  vm.discussions = []
  vm.permissions = []
  vm.search = ''
  vm.user = userService.getUser()
  vm.isLoading = true

  vm.changeSubscription = changeSubscription
  vm.deleteDiscussion = deleteDiscussion
  vm.editTitleDialog = editTitleDialog
  vm.evaluateFilter = evaluateFilter
  vm.getDiscussions = getDiscussions
  vm.newDiscussionDialog = newDiscussionDialog
  vm.subscriptionIcon = subscriptionIcon
  vm.viewThread = viewThread

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab
    discussionService.getSiteUserPermissions($stateParams.projekt)
    .then(function (response) {
      vm.permissions = response
    })
    vm.getDiscussions($stateParams.projekt)
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

  function newDiscussionDialog () {
    $mdDialog.show({
      controller: 'ModalController',
      controllerAs: 'modalVm',
      locals: {
        postItem: '',
        discussion: null,
        siteShortName: $stateParams.projekt
      },
      template: newThreadTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true,
      onComplete: function () {
        vm.loaded = true
      }
    })
    .then(function (response) {
      vm.getDiscussions($stateParams.projekt)
    })
  }

  function viewThread (postItem) {
    return APP_CONFIG.sitesUrl + '/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef)
  }

  function deleteDiscussion (postItem) {
    discussionService.deletePost(postItem).then(function (response) {
      vm.getDiscussions($stateParams.projekt)
    })
  }

  function editTitleDialog (postItem) {
    $mdDialog.show({
      controller: 'ModalController',
      controllerAs: 'modalVm',
      locals: {
        postItem: postItem,
        discussion: null,
        siteShortName: null
      },
      template: editTitleTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
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
