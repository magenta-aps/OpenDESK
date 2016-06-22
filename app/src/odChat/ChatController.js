
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
                        fullname: person.firstName + ' ' + person.lastName + ' (' + person.userName + ')'
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
        
        // When "Call button" is clicked, display a video link message to everyone in the chat room
        converse.listen.on('callButtonClicked', function(event, data) {
            
            //console.log(data.connection);
            //console.log(data.model);

            // This link will be unique to the chat room
            var videoLink = 'https://jitsi.magenta-aps.dk/' + data.model.get('jid').replace( /[^a-z]/gi, '' );
            
            var message = 'vil gerne starte en videochat med dig. Klik linket for at starte: ' + videoLink;
            var msgObj = {
                to: data.model.get('jid'),
                id: (new Date()).getTime()
            };
            if (data.model.attributes.type === 'chatroom') {
                console.log('this is a group chat');
                msgObj.type = 'groupchat'
            } else {
                console.log('this is a 1:1 chat');
                msgObj.type = 'chat'
            };
            var msg = converse.env.$msg( msgObj ).c('body').t(message).up().c('active', {'xmlns': 'http://demo.opendesk.dk/protocol/chatstates'}).tree();
            converse.send(msg);
            
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
