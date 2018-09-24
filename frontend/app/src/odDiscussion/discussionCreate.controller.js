'use strict'
import '../shared/services/nodeRefUtils.service'

angular
  .module('openDeskApp.discussion')
  .controller('DiscussionCreateController', ['$scope', '$stateParams', '$state', 'discussionService', 'nodeRefUtilsService', DiscussionCreateController])

function DiscussionCreateController ($scope, $stateParams, $state, discussionService, nodeRefUtilsService) {
  var vm = this

  $scope.ckEditorCallback = function (value) {
    $scope.changedContent = value
  }

  vm.isLoading = true

  vm.newDiscussion = newDiscussion
  vm.newDiscussionDialog = newDiscussionDialog
  vm.viewThread = viewThread

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab
  }

  function newDiscussionDialog () {
    $scope.changedContent = ''
    $scope.ckEditorCallback = function (value) {
      $scope.changedContent = value
    }
    vm.loaded = true
  }

  function newDiscussion (title, content) {
    discussionService.addDiscussion($stateParams.projekt, title, content)
      .then(function (response) {
        discussionService.subscribeToDiscussion($stateParams.projekt, response.item)
      })
  }

  function viewThread (postItem) {
    $state.go('project.viewthread', { path: nodeRefUtilsService.getId(postItem.nodeRef) })
  }
}
