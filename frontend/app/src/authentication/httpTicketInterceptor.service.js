'use strict'

angular
  .module('openDeskApp')
  .config(['$httpProvider', config])
  .factory('httpTicketInterceptor', ['$injector', '$state', '$translate', '$window', '$q', 'sessionService',
    'ALFRESCO_URI', httpTicketInterceptor])

function config ($httpProvider) {
  $httpProvider.interceptors.push('httpTicketInterceptor')
  $httpProvider.defaults.headers.common.Authorization = undefined
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
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
    } else if (config.url.startsWith('/alfresco') &&
      config.url !== '/alfresco/service/api/login' &&
      config.url !== '/alfresco/s/ssologin' &&
      config.url !== '/alfresco/service/settings/public'
    ) {
      config = {}
    }

    return config
  }

  function prefixAlfrescoServiceUrl (url) {
    if (url.indexOf('/api/') === 0 || url.indexOf('/opendesk/') === 0 || url.indexOf('/slingshot/') === 0 || url.indexOf('/lool') === 0 || url.indexOf('/wopi') === 0 || url === '/touch')
      return ALFRESCO_URI.webClientServiceProxy + url
    else if (url.indexOf('/share/') === 0 || url.indexOf('/opendesk/') === 0 || url.indexOf('/slingshot/') === 0 || url === '/touch')
      return ALFRESCO_URI.webClientServiceProxy + url

    return url
  }

  function response (response) {
    if (response.status === 401 && typeof $window._openDeskSessionExpired === 'undefined')
      sessionExpired()

    return response || $q.when(response)
  }

  function responseError (rejection) {
    // Prevent from popping up the message on failed SSO attempt
    if (rejection.status === 401 && rejection.config.url.indexOf('/touch') === -1)
      sessionExpired()

    return $q.reject(rejection)
  }

  function sessionExpired () {
    if (typeof $window._openDeskSessionExpired !== 'undefined') return

    sessionService.retainCurrentLocation()
    sessionService.logout()
  }
}
