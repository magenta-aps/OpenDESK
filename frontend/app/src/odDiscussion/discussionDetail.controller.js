'use strict'
import '../shared/services/nodeRefUtils.service'
// import newThreadTemplate from './view/newThread.tmpl.html'
import editTemplate from './view/edit.tmpl.html'
import editFirstPostTemplate from './view/editFirstPost.tmpl.html'
import editTitleTemplate from './view/editTitle.tmpl.html'

angular
  .module('openDeskApp.discussion')
  .controller('DiscussionDetailController', ['$scope', '$timeout', '$mdDialog', '$state', '$stateParams',
    '$anchorScroll', '$location', 'discussionService', 'siteService', 'UserService', DiscussionDetailController])

function DiscussionDetailController ($scope, $timeout, $mdDialog, $state, $stateParams, $anchorScroll,
  $location, discussionService, siteService, UserService) {
  var vm = this

  $scope.ckEditorCallback = function (value) {
    $scope.changedContent = value
  }

  vm.discussions = []
  vm.permissions = []
  vm.replies = []
  vm.search = ''
  vm.user = UserService.get()
  vm.isLoading = true

  vm.cancelDialog = cancelDialog
  vm.deleteDiscussion = deleteDiscussion
  vm.editFirstPost = editFirstPost
  vm.editFirstPostDialog = editFirstPostDialog
  vm.editReply = editReply
  vm.editReplyDialog = editReplyDialog
  vm.editTitleDialog = editTitleDialog
  vm.getReplies = getReplies
  vm.reply = reply
  vm.viewDiscussions = viewDiscussions

  // sets the margin to the width of sidenav
  var tableHeight = $(window).height() - 300 - $('header').outerHeight() - $('md-tabs-wrapper').outerHeight()
  $('.od-discussion').css('max-height', tableHeight + 'px')

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab
    getSiteUserPermissions()

    if ($stateParams.path) {
      var nodeId = $stateParams.path.split('#')[0]
      discussionService.getDiscussionFromNodeRef(nodeId)
        .then(function (discussion) {
          vm.selectedDiscussion = discussion
          vm.getReplies(vm.selectedDiscussion)
        })
    }
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function getReplies (postItem) {
    vm.replies = ''
    discussionService.getReplies(postItem)
      .then(function (response) {
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

  function reply (content) {
    discussionService.addReply(vm.selectedDiscussion, content)
      .then(function () {
        discussionService.subscribeToDiscussion($stateParams.projekt, vm.selectedDiscussion)
        vm.getReplies(vm.selectedDiscussion)
        $mdDialog.cancel()
      })
  }

  function deleteDiscussion (postItem) {
    discussionService.deletePost(postItem)
      .then(function () {
        vm.getReplies(vm.selectedDiscussion)
      })
  }

  function editReply (postItem, content) {
    discussionService.updatePost(postItem, '', content)
      .then(function () {
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
    discussionService.updatePost(postItem, title, content)
      .then(function () {
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
}
