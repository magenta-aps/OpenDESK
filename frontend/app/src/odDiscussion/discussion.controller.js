'use strict'
import '../shared/services/nodeRefUtils.service'
// import replyTemplate from './view/reply.tmpl.html'
import newThreadTemplate from './view/newThread.tmpl.html'
// import editTemplate from './view/edit.tmpl.html'
// import editFirstPostTemplate from './view/editFirstPost.tmpl.html'
import editTitleTemplate from './view/editTitle.tmpl.html'

angular
  .module('openDeskApp.discussion')
  .controller('DiscussionController', ['$scope', '$mdDialog', '$state', '$stateParams',
    '$interval', 'discussionService', 'nodeRefUtilsService', 'siteService',
    'UserService', DiscussionController])

function DiscussionController ($scope, $mdDialog, $state, $stateParams, $interval,
  discussionService, nodeRefUtilsService, siteService, UserService) {
  var vm = this

  $scope.ckEditorCallback = function (value) {
    $scope.changedContent = value
  }

  vm.discussions = []
  vm.permissions = []
  vm.search = ''
  vm.user = UserService.get()
  vm.isLoading = true

  vm.cancelDialog = cancelDialog
  vm.changeSubscription = changeSubscription
  vm.deleteDiscussion = deleteDiscussion
  vm.editTitleDialog = editTitleDialog
  vm.evaluateFilter = evaluateFilter
  vm.getDiscussions = getDiscussions
  vm.newDiscussion = newDiscussion
  vm.newDiscussionDialog = newDiscussionDialog
  vm.subscriptionIcon = subscriptionIcon
  vm.viewThread = viewThread

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab
    getSiteUserPermissions()
    vm.getDiscussions($stateParams.projekt)
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

  function getSiteUserPermissions () {
    vm.permissions = siteService.getPermissions()
    if (vm.permissions === undefined)
      siteService.getSiteUserPermissions($stateParams.projekt)
        .then(function (permissions) {
          vm.permissions = permissions
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
    discussionService.addDiscussion($stateParams.projekt, title, content)
      .then(function (response) {
        discussionService.subscribeToDiscussion($stateParams.projekt, response.item)
        vm.getDiscussions($stateParams.projekt)
        $mdDialog.cancel()
      })
  }

  function viewThread (postItem) {
    $state.go('project.viewthread', { path: nodeRefUtilsService.getId(postItem.nodeRef) })
  }

  function deleteDiscussion (postItem) {
    discussionService.deletePost(postItem)
      .then(function () {
        vm.getDiscussions($stateParams.projekt)
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

    $interval(function () { }, 1, 1000)
  }

  function changeSubscription (postItem) {
    postItem.isSubscribed = !postItem.isSubscribed
    discussionService.subscribe($stateParams.projekt, postItem, postItem.isSubscribed)
  }

  function subscriptionIcon (value) {
    return String(value) === 'true' ? 'notifications_active' : 'notifications_none'
  }
}
