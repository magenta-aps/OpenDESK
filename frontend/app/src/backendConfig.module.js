//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.backendConfig', [])
  .constant('APP_BACKEND_CONFIG', {
    enableFavouriteSiteNotifications: false,
    enableProjects: false,
    enableSites: true,
    enableESDH: false,
    enableChat: false,
    editors: {
      msOffice: false,
      libreOffice: false,
      onlyOffice: false
    },
    dashboardLink: [
      {
        icon: 'intra',
        label: 'Intra',
        url: '',
        newWindow: false
      },
      {
        icon: 'project',
        label: 'Grupperum',
        url: 'grupperum',
        newWindow: false
      },
      {
        icon: 'mail',
        label: 'Mail',
        url: '',
        newWindow: false
      },
      {
        icon: 'library',
        label: 'Dokumenter',
        url: 'dokumenter',
        newWindow: false
      }
    ],
    public: {
      appName: 'OpenDesk'
    }
  })
