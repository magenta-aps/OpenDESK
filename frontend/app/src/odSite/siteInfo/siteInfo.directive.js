// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import siteInfoTemplate from './siteInfo.view.html'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteInfo', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      template: siteInfoTemplate,
      controller: 'SiteInfoController',
      controllerAs: 'vm'
    }
  })
