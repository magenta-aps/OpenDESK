//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('FundListController', ['$scope', '$stateParams', 'APP_FUND_CONFIG', FundListController])

function FundListController ($scope, $stateParams, APP_FUND_CONFIG) {
  // Mock section name by looking at current path variable 'flow', and see which of the menu links end with this path.
  const endsWithPath = new RegExp($stateParams.flow + '$', 'gi')
  $scope.label = APP_FUND_CONFIG.fundLink.find(link => {
    const matchesUrl = link.url.match(endsWithPath)
    return matchesUrl ? matchesUrl.length : null
  }).label

  // Mock a list of applications
  $scope.applications = [
    {
      title: 'Test case Henrik',
      id: '20181003-15807',
      type: 'Standardsag',
      created: '03. Oct. 2018 15:11',
      modified: '03. Oct. 2018 15:15',
      status: 'Aktiv'
    },
    {
      title: 'Implementering af nyt ESDH-system',
      id: '20160830-5404',
      type: 'Standardsag',
      created: '30. Aug. 2016 12:05',
      modified: '26. Sep. 2018 10:07',
      status: 'Aktiv'
    },
    {
      title: '3K',
      id: '20180926-15635',
      type: 'Standardsag',
      created: '26. Sep. 2018 09:43',
      modified: '26. Sep. 2018 09:50',
      status: 'Aktiv'
    },
    {
      title: '3K ESDH-leverandørrunde',
      id: '20180921-14819',
      type: 'Standardsag',
      created: '21. Sep. 2018 14:58',
      modified: '25. Sep. 2018 17:43',
      status: 'Aktiv'
    },
    {
      title: 'Ansøgning nyt stadion AGF',
      id: '20180904-14442',
      type: 'Standardsag',
      created: '04. Sep. 2018 13:06',
      modified: '25. Sep. 2018 09:29',
      status: 'Aktiv'
    },
    {
      title: 'IT-forum',
      id: '20170131-8802',
      type: 'Standardsag',
      created: '31. Jan. 2017 14:28',
      modified: '19. Jun. 2018 10:07',
      status: 'Aktiv'
    },
    {
      title: 'Kommunalt driftbudget 2018',
      id: '20180618-12980',
      type: 'Standardsag',
      created: '18. Jun. 2018 11:46',
      modified: '18. Jun. 2018 11:54',
      status: 'Aktiv'
    },
    {
      title: 'Chefgruppemøder 2016',
      id: '20160831-5543',
      type: 'Standardsag',
      created: '31. Aug. 2016 14:13',
      modified: '08. Jun. 2018 10:32',
      status: 'Aktiv'
    }
  ]
}
