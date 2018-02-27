angular.module('odEmail')
.component('odEmailSend', {
  templateUrl: '/app/src/components/odEmail/view/send.html',
  controller: 'odEmailController',
  bindings: {
      email: '<'
  }
});