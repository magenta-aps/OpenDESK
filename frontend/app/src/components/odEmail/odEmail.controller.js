angular
  .module('odEmail')
  .controller('odEmailController', odEmailController)

function odEmailController ($mdDialog, $mdToast, odEmailService) {
  var vm = this

  vm.cancelDialog = cancelDialog
  vm.sendEmail = sendEmail

  function cancelDialog () {
    $mdDialog.cancel()
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
