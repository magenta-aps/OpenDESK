'use strict'

angular.module('openDeskApp').factory('nodeRefUtilsService', nodeRefUtilsService)

function nodeRefUtilsService () {
  return {
    getId: function (nodeRef) {
      return nodeRef.split('/')[3]
    }
  }
}
