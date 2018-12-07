// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import siteMembersTemplate from './siteMembers.view.html'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteMembers', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      template: siteMembersTemplate,
      controller: 'SiteMemberController',
      controllerAs: 'vm'
    }
  })
