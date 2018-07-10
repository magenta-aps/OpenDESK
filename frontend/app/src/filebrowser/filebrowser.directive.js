'use strict'

angular
  .module('openDeskApp.filebrowser')
  .directive('odFilebrowser', function () {
    return {
      restrict: 'E',
      scope: {
        type: '@odType'
      },
      templateUrl: 'app/src/filebrowser/view/filebrowser.html',
      controller: 'FilebrowserController',
      controllerAs: 'vm'
    }
  })
