// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp.init', ['ngMaterial'])
  .constant('USER_ROLES', {
    admin: 'admin',
    user: 'user'
    // guest: 'guest' we don't want this type of user as of yet
  })
  .constant('ALFRESCO_URI', {
    apiProxy: '/alfresco/api/',
    serviceApiProxy: '/api/',
    serviceSlingshotProxy: '/slingshot/',
    webClientServiceProxy: '/alfresco/service'
  })
  .constant('PATTERNS', {
    fileName: /^[a-zA-Z0-9_\-,.!@#$%^&()=+ ]+$/,
    phone: /^[+]?[0-9\- ]+$/
  })
  .constant('APP_CONFIG', {
    sitesUrl: 'grupperum',
    landingPageState: 'dashboard',
    landingPageUrl: '',
    ssoLoginEnabled: false
  })
  .constant('BROWSER_CONFIG', {})
