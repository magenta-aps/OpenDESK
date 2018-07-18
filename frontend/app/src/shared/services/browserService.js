angular
  .module('openDeskApp')
  .factory('browserService', BrowserService)

function BrowserService (APP_BACKEND_CONFIG) {
  var ua = window.navigator.userAgent.toLowerCase()
  var _isIE = (ua.indexOf('msie') !== -1) || (ua.indexOf('trident') !== -1)
  var _isEdge = (ua.indexOf('edge') !== -1)
  var _isOpera = (ua.indexOf('opr') !== -1)
  var _isChrome = (ua.indexOf('chrome') !== -1) && (!_isOpera)
  var _isFirefox = (ua.indexOf('firefox') !== -1)
  var _isSafari = (ua.indexOf('safari') !== -1) && (!(_isChrome || _isOpera))
  var _isMac = (ua.indexOf('mac') !== -1)
  var _isWin = (ua.indexOf('win') !== -1)
  var _isIOS = (ua.indexOf('ipad') !== -1) || (ua.indexOf('iphone') !== -1) || (ua.indexOf('ipod') !== -1)
  var latestTitle

  return {
    restoreTitle: restoreTitle,
    setTitle: setTitle,
    isIE: isIE,
    isEdge: isEdge,
    isChrome: isChrome,
    isFirefox: isFirefox,
    isSafari: isSafari,
    isMac: isMac,
    isWin: isWin,
    isIOS: isIOS
  }

  function restoreTitle () {
    angular.element(window.document)[0].title = latestTitle
  }

  function setTitle (pageTitle) {
    var title = APP_BACKEND_CONFIG.public.appName
    if (pageTitle !== undefined)
      title += ' - ' + pageTitle
    angular.element(window.document)[0].title = title
    latestTitle = title
  }

  function isIE () {
    return _isIE
  }

  function isEdge () {
    return _isEdge
  }

  function isChrome () {
    return _isChrome
  }

  function isFirefox () {
    return _isFirefox
  }

  function isSafari () {
    return _isSafari
  }

  function isMac () {
    return _isMac
  }

  function isWin () {
    return _isWin
  }

  function isIOS () {
    return _isIOS
  }
}
