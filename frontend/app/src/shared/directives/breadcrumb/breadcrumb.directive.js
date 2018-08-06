'use strict'
import breadcrumbTemplate from './breadcrumb.html'

angular
  .module('openDeskApp')
  .directive('breadcrumb', breadcrumb)

function breadcrumb () {
  return {
    restrict: 'E',
    scope: {
      bcPath: '=paths'
    },
    template: breadcrumbTemplate
  }
}
