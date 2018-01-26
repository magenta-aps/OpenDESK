angular
    .module('openDeskApp.chat')
    .factory('chatService', chatService);

function chatService(XMPP_DOMAIN, userService) {
    var initialized = false;

    return {
        initialize: initialize,
        login: login,
        logout: logout
    };

    function login(username, password) {
        converse.user.login({
            jid: username + '@' + XMPP_DOMAIN,
            password: password
        });
    }

    function logout() {
        if (!initialized || !converse.connection.connected()) {
            return;
        }
        converse.user.logout();
        var controlBox = angular.element(document.getElementById("toggle-controlbox"));
        controlBox.css("display", "none");
    }

    function initialize() {
        if (initialized) {
            return false;
        }
        initialized = true;
        var userSearchCallback = function (query, callback) {
            userService.getPeople('?filter=' + encodeURIComponent(query)).then(function (data) {
                callback(data.people.map(function (person) {
                    return {
                        id: person.userName + '@' + XMPP_DOMAIN,
                        fullname: person.firstName + ' ' + person.lastName + ' (' + person.userName + ')'
                    };
                }));
            });
        };

        // Initialize ConverseJS chat
        converse.initialize({
            bosh_service_url: '/http-bind',
            //debug: true,
            i18n: locales['da'], // Refer to ./src/locales.js in converseJS project to see which locales are supported
            keepalive: true,
            allow_logout: false,
            allow_registration: false,
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
        converse.listen.on('callButtonClicked', function (event, data) {

            // This link will be unique to the chat room
            var videoLink = 'https://meet.jit.si/' + data.model.get('jid').replace(/[^a-z]/gi, '');

            var message = 'vil gerne starte en videochat med dig. Klik linket for at starte: ' + videoLink;

            var msgObj = {
                from: converse.user.jid(),
                to: data.model.get('jid'),
                type: 'chat'
            };

            if (data.model.attributes.type === 'chatroom') {
                msgObj.type = 'groupchat';
            }
            ;
            //var msg = converse.env.$msg(msgObj).c('body').t(message);
            var msg = converse.env.$msg(msgObj).c('body').t(message);
            converse.send(msg);

            // Opens a chat window on the calling user's end
            window.open(videoLink, '', 'width=600,height=600');

        });
        return true;
    };
}
