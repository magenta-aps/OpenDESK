
    angular
        .module('openDeskApp.chat')
        .controller('ChatController', ChatController)
        .directive('odChat', function() {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: '/app/src/odChat/view/chat.html'
            };
        });

    function ChatController($scope, $mdToast) {
        var vm = this;

        // Initialize ConverseJS chat
        converse.initialize({
            bosh_service_url: '/http-bind', // Please use this connection manager only for testing purposes
            i18n: locales['da'], // Refer to ./src/locales.js in converseJS project to see which locales are supported
            show_controlbox_by_default: false,
            roster_groups: true,
            hide_muc_server: true,
            hide_offline_users: true,
            allow_dragresize: false,
            visible_toolbar_buttons: {
                call: true
            }
        });
        
        converse.listen.on('callButtonClicked', function(event, data) {
            console.log('Strophe connection is ', data.connection);
            console.log('Bare buddy JID is ', data.model.get('jid'));
            // ... Third-party library code ...
        });
        
        // Popup a notice
        vm.popNotice = function(noticeObj) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(noticeObj.notice)
                    .position('top right')
                    .action('Luk')
            );
        };

    };
