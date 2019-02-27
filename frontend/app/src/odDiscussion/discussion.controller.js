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
  .controller('DiscussionController', ['$scope', '$state', '$stateParams', DiscussionController])

function DiscussionController ($scope, $state, $stateParams) {
  var vm = this

  vm.selectedDiscussion = {}
  vm.discussionId = null
  vm.siteShortName = null

  vm.viewDiscussions = viewDiscussions

  $scope.$on('getDiscussion', function (event, data) {
    vm.selectedDiscussion = data // receive data from child component
  })

  activate()

  function activate () {
    $scope.tab.selected = $stateParams.selectedTab

    if ($stateParams.discussion) {
      vm.discussionId = $stateParams.discussion.split('#')[0]
      vm.siteShortName = $stateParams.projekt
    }
  }

  function viewDiscussions () {
    $state.go('project.discussions')
  }
}
