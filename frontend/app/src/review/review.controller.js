'use strict';

angular.module('od.review', ['members'])
.controller('ReviewController', ReviewController)
.directive('odReviewList', odReviewList)
.directive('odReviewDetail', odReviewDetail);

function ReviewController(review, $mdDialog) {
    var vm = this;

    vm.member;
    vm.comment;
    vm.approve = approve;
    vm.reject = reject;
    vm.create = create;
    vm.cancelDialog = cancelDialog;

    function create () {
      console.log('create review')
      console.log(vm.member);
      console.log(vm.comment)
      review.create();
    }

    function approve () {
      console.log('approve review');
      review.approve();
    }

    function reject () {
      console.log('reject review');
      review.reject();
    }

    function cancelDialog () {
      $mdDialog.cancel();
    }
}


function odReviewList () {
  return {
      restrict: 'E',
      scope: {
        items: "=items"
      },
      templateUrl: 'app/src/review/reviewList.view.html',
      controller: 'ReviewController as vm'
  };
}

function odReviewDetail () {
  return {
      restrict: 'E',
      scope: {
        review: "=item"
      },
      templateUrl: 'app/src/review/reviewDetail.view.html',
  };
}