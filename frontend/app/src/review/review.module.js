// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import reviewCreateTemplate from './reviewCreate.view.html'
import reviewDetailTemplate from './reviewDetail.view.html'
import reviewListTemplate from './reviewList.view.html'

angular.module('od.review', [])
  .directive('odCreateReview', odCreateReview)
  .directive('odReviewDetail', odReviewDetail)
  .directive('odReviewList', odReviewList)

function odCreateReview () {
  return {
    restrict: 'A',
    scope: {
      nodeId: '='
    },
    template: reviewCreateTemplate,
    controller: 'ReviewController',
    controllerAs: 'vm'
  }
}

function odReviewList () {
  return {
    restrict: 'E',
    scope: {
      reviewId: '='
    },
    template: reviewListTemplate,
    controller: 'ReviewController',
    controllerAs: 'vm'
  }
}

function odReviewDetail () {
  return {
    restrict: 'E',
    scope: {
      reply: '='
    },
    template: reviewDetailTemplate
  }
}
