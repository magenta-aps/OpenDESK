
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

    function ChatController($scope, $mdToast, userService) {
        var vm = this;

        var userSearchCallback = function (query, callback) {
            // Grab the user's jabber domain, for constructing jabber domains for each user in the results.
            var xmppDomain = converse.user.jid().match("@(.+?)/")[1];
            userService.getPeople('?filter=' + encodeURIComponent(query)).then(function (data) {
                callback(data.people.map(function (person) {
                    return {
                        id: person.userName + '@' + xmppDomain,
                        fullname: person.firstName + ' ' + person.lastName
                    };
                }));
            });
        };

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
            },
            xhr_user_search: true,
            xhr_user_search_callback: userSearchCallback
        });
        
        converse.listen.on('callButtonClicked', function(event, data) {
            console.log('watlihaselfihas elfihsal efihse flhi');
            //console.log('Strophe connection is', data.connection);
            //console.log('Bare buddy JID is', data.model.get('jid'));
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
