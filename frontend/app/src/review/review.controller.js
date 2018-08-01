'use strict'

angular.module('od.review')
  .controller('ReviewController', ['reviewService', '$mdDialog', '$scope', ReviewController])

function ReviewController (reviewService, $mdDialog, $scope) {
  var vm = this

  if ($scope.reviewId)
    reviewService.get($scope.reviewId)
      .then(function (response) {
        vm.review = response
      })

  vm.approve = approve
  vm.reject = reject
  vm.create = create
  vm.reply = reply
  vm.cancelDialog = cancelDialog

  function create (nodeId, user, message) {
    reviewService.create(nodeId, user.userName, message)
    cancelDialog()
  }

  function approve (reply) {
    reviewService.approve($scope.reviewId, reply)
    cancelDialog()
  }

  function reject (reply) {
    reviewService.reject($scope.reviewId, reply)
    cancelDialog()
  }

  function reply (reply) {
    reviewService.reply($scope.reviewId, reply)
    cancelDialog()
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }
}
