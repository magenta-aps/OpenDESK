// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('odEmail')
  .controller('odEmailController', ['$mdDialog', '$mdToast', 'odEmailService', odEmailController])

function odEmailController ($mdDialog, $mdToast, odEmailService) {
  var vm = this

  vm.cancelDialog = cancelDialog
  vm.ckEditorCallback = ckEditorCallback
  vm.sendEmail = sendEmail

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function ckEditorCallback (value) {
    vm.email.body = value
  }

  function sendEmail () {
    cancelDialog()
    odEmailService.sendEmail(vm.email).then(
      function (response) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Email sendt til ' + vm.email.userName + '.')
            .hideDelay(3000)
        )
      }, function (error) {
        console.log(error)
        $mdToast.show(
          $mdToast.simple()
            .textContent('Email kunne ikke sendes til ' + vm.email.userName + '.')
            .hideDelay(3000)
        )
      })
  }
}
