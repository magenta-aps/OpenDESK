(function () {
  'use strict'

  angular
    .module('openDeskApp.header')
    .factory('headerService', headerService)

  function headerService () {
    var currentTitle = ''

    var service = {
      setTitle: setTitle,
      getTitle: getTitle
    }

    return service

    function setTitle (title) {
      currentTitle = title
    }

    function getTitle () {
      return currentTitle
    }
  }
})()
