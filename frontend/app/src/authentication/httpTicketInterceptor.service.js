// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp')
  .config(['$httpProvider', config])
  .factory('httpTicketInterceptor', ['$injector', '$state', '$translate', '$window', '$q', 'sessionService',
    'ALFRESCO_URI', httpTicketInterceptor])

function config ($httpProvider) {
  $httpProvider.interceptors.push('httpTicketInterceptor')
}

function httpTicketInterceptor ($injector, $state, $translate, $window, $q, sessionService, ALFRESCO_URI) {
  return {
    request: request,
    response: response,
    responseError: responseError
  }

  function request (config) {
    config.url = prefixAlfrescoServiceUrl(config.url)
    var userInfo = sessionService.getUserInfo()

    if (userInfo) {
      config.params = config.params || {}
      config.params.alf_ticket = sessionService.getUserInfo().ticket
    }

    return config
  }

  function prefixAlfrescoServiceUrl (url) {
    if (url.indexOf('/api/') === 0 || url.indexOf('/opendesk/') === 0 || url.indexOf('/slingshot/') === 0 || url.indexOf('/lool') === 0 || url.indexOf('/wopi') === 0 || url === '/touch')
      return ALFRESCO_URI.webClientServiceProxy + url

    return url
  }

  function response (response) {
    if (response.status === 401)
      sessionExpired()

    return response || $q.when(response)
  }

  function responseError (rejection) {
    if (rejection.status === 401)
      sessionExpired()

    return $q.reject(rejection)
  }

  function sessionExpired () {
    // Important to inject mdToast like this to prevent 'Uncaught Error: [$injector:cdep] Circular dependency found'
    var $mdToast = $injector.get('$mdToast')
    $mdToast.show(
      $mdToast.simple()
        .content($translate.instant('LOGIN.SESSION_TIMEOUT'))
        .hideDelay(3000)
    )
    sessionService.logout()
  }
}
