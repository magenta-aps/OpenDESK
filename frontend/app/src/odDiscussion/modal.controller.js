//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.discussion')
  .controller('ModalController', ['$scope', '$stateParams', 'postItem', 'discussion', 'siteShortName', '$mdDialog', 'discussionService', ModalController])

function ModalController ($scope, $stateParams, postItem, discussion, siteShortName, $mdDialog, discussionService) {
  this.reply = reply
  this.editReply = editReply
  this.editFirstPost = editFirstPost
  this.newDiscussion = newDiscussion
  this.cancelDialog = cancelDialog

  $scope.postItem = postItem
  $scope.discussion = discussion
  $scope.changedContent = postItem
  $scope.ckEditorCallback = function (value) {
    $scope.changedContent = value
  }

  function reply (discussionObj, content) {
    discussionService.addReply(discussionObj, content).then(function (response) {
      if ($stateParams.projekt) {
        discussionService.subscribeToDiscussion($stateParams.projekt, discussionObj)
      }
      $mdDialog.hide(response)
    })
  }

  function editReply (postItem, content) {
    discussionService.updatePost(postItem, '', content).then(function (response) {
      $mdDialog.hide(response)
    })
  }

  function editFirstPost (postItem, title, content) {
    discussionService.updatePost(postItem, title, content).then(function () {
      $mdDialog.hide(content)
    })
  }

  function newDiscussion (title, content) {
    discussionService.addDiscussion(siteShortName, title, content).then(function (response) {
      discussionService.subscribeToDiscussion(siteShortName, response.item)
      $mdDialog.hide(response)
    })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }
}
