angular
    .module('openDeskApp')
    .controller('AuthController', AuthController);

function AuthController($state, $stateParams, authService, userService, $mdDialog, sessionService, $window, chatService) {
    var vm = this;
    var loginErrorMessage = angular.fromJson($stateParams.error);

    vm.errorMsg = loginErrorMessage ? loginErrorMessage : "";
    vm.login = login;
    vm.logout = logout;
    vm.showForgotDialog = showForgotDialog;
    vm.updateValidator = updateValidator;

    function login(credentials) {
        authService.login(credentials.username, credentials.password).then(function (response) {
            // Logged in
            if (response.userName) {
                chatService.initialize();
                chatService.login(credentials.username, credentials.password);
                userService.getPerson(credentials.username).then(function (response) {
                    vm.user = response;
                    restoreLocation();
                });
            }

            // If incorrect values            
            if (response.status == 403) {
                vm.form.password.$setValidity("loginFailure", false);
            } else if (response.status == 500) {
                vm.form.password.$setValidity("loginError", false);
            }
        });
    }

    function logout() {
        chatService.logout();
        delete vm.user;
        authService.logout();
    }

    function showForgotDialog(ev) {
        $mdDialog.show({
            controller: forgotPasswordCtrl,
            controllerAs: 'dlg',
            templateUrl: 'app/src/authentication/view/forgotPasswordDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }

    function updateValidator() {
        if (vm.form.password.$error.loginFailure)
            vm.form.password.$setValidity("loginFailure", true);
    }

    function restoreLocation() {
        var retainedLocation = sessionService.getRetainedLocation();
        if (!retainedLocation || retainedLocation === undefined) {
            $state.go('siteList');
        } else {
            $window.location = retainedLocation;
        }
    }

    function forgotPasswordCtrl($scope, $mdDialog) {
        var dlg = this;
        dlg.emailSent = false;

        dlg.cancel = function () {
            return $mdDialog.cancel();
        };

        dlg.updateValidators = function () {
            if (dlg.form.email.$error.emailNotExists)
                dlg.form.email.$setValidity("emailNotExists", true);
        };

        dlg.forgotPassword = function () {
            if (!dlg.email) return;

            authService.changePassword(dlg.email).then(
                function success(response) {
                    dlg.emailSent = true;
                },

                function onError(response) {
                    // If email doesn't exist in system
                    if (response.status !== 200)
                        dlg.form.email.$setValidity("emailNotExists", false);
                }
            );
        };
    };
}
