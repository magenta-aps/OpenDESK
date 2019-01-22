//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
angular.module('openDeskApp.fund')
  .constant('APP_FUND_CONFIG', {
    fundBaseColor: '#747474',
    fundLink: [
      // @TODO: Make a service that gets what links should be there.
      {
        icon: 'mail',
        label: 'Indkomne ansøgninger',
        url: 'fondsansogninger/incoming', // append a path to whatever url we specified in config() below
        newWindow: false
      },
      {
        icon: null,
        label: 'Centrale ansøgninger',
        url: 'fondsansogninger/central',
        newWindow: false
      },
      {
        icon: null,
        label: 'Lokale ansøgninger',
        url: 'fondsansogninger/local',
        newWindow: false
      },
      {
        icon: null,
        label: 'Møde i bestyrelsen',
        url: 'fondsansogninger/boardmeeting',
        newWindow: false
      },
      {
        icon: null,
        label: 'Kald',
        url: 'fondsansogninger/calls',
        newWindow: false
      },
      {
        icon: null,
        label: 'Bruger/grupper/bankområder',
        url: 'fondsansogninger/usergroups',
        newWindow: false
      },
      {
        icon: null,
        label: 'Projektrum',
        url: 'fondsansogninger/projects',
        newWindow: false
      },
    ],
  })
