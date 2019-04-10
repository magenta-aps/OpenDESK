//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import applicationBlockTemplate from './applicationBlock.html'
import assignedAmount from '../common/block.assigned-amount.view.html'
import basicInformation from '../common/block.basic-information.view.html'
import discussion from '../common/block.discussion.view.html'
import meetingVote from '../common/block.meeting-vote.view.html'
import previousFunds from '../common/block.previous-funds.view.html'
import projectDescription from '../common/block.project-description.view.html'

angular.module('openDeskApp.fund')
  .component('applicationBlock', {
    template: applicationBlockTemplate,
    controllerAs: 'vm',
    transclude: true,
    bindings: {
      block: '='
    }
  })
  .component('applicationBlockAssignedAmount', {
    template: assignedAmount,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
  .component('applicationBlockBasicInformation', {
    template: basicInformation,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
  .component('applicationBlockDiscussion', {
    template: discussion,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
  .component('applicationBlockMeetingVote', {
    template: meetingVote,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
  .component('applicationBlockPreviousFunds', {
    template: previousFunds,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
  .component('applicationBlockProjectDescription', {
    template: projectDescription,
    controller: 'ApplicationBlockController',
    controllerAs: 'vm'
  })
