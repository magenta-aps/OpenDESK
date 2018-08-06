'use strict'
import '../shared/filters/customDateFilter'
import notificationsTemplate from './notifications.view.html'

angular
  .module('openDeskApp.notifications')
  .directive('odNotifications', function () {
    return {
      restrict: 'E',
      scope: {},
      template: notificationsTemplate,
      controller: 'NotificationsController',
      controllerAs: 'vm'
    }
  })
