// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular.module('od.review')
  .controller('ReviewController', ['reviewService', '$mdDialog', '$scope', ReviewController])

function ReviewController (reviewService, $mdDialog, $scope) {
  var vm = this

  vm.create = create
  vm.respond = respond
  vm.cancelDialog = cancelDialog

  vm.checkboxApprove = false
  vm.checkboxReject = false
  vm.comment = ''

  activate()

  function activate () {
    if ($scope.reviewId)
      load()
  }

  function create (nodeId, user, message) {
    reviewService.create(nodeId, user.userName, message)
    cancelDialog()
  }

  function approve (reply) {
    reviewService.approve($scope.reviewId, reply)
      .then(function () {
        load()
      })
  }

  function load () {
    reviewService.get($scope.reviewId)
      .then(function (response) {
        vm.review = response
        vm.comment = ''
      })
  }

  function reject (reply) {
    reviewService.reject($scope.reviewId, reply)
      .then(function () {
        load()
      })
  }

  function reply (reply) {
    reviewService.reply($scope.reviewId, reply)
      .then(function () {
        load()
      })
  }

  function respond () {
    if (vm.checkboxApprove)
      approve(vm.comment)
    else if (vm.checkboxReject)
      reject(vm.comment)
    else
      reply(vm.comment)
    cancelDialog()
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }
}
