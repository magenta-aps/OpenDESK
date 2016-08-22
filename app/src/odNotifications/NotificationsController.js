
    angular
        .module('openDeskApp.notifications')
        .controller('NotificationsController', NotificationsController)
        .directive('odNotifications', function() {
            return {
              restrict: 'E',
              scope: false,
              templateUrl: '/app/src/odNotifications/view/notifications.html'
            };
        });

    function NotificationsController($scope, $timeout, $log, $mdToast, notificationsService, sessionService) {
        var vm = this;
				
				var userInfo = sessionService.getUserInfo();
				var currentUser = userInfo.user.userName;
				
        vm.notifications = new Array();
        vm.on = false;
        vm.toggleNotices = function() {
            vm.on = !vm.on;
        }

        // Popup a notice
        vm.popNotice = function(noticeObj) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(noticeObj.notice)
                    .position('top right')
                    .action('Luk')
            );
        };
        
        notificationsService.getNotices(currentUser).then (function (val) {
            vm.notifications = val;
            // console.log(val);
        });


        // vm.notifications = [
        //    {id: 1, notice: 'Someone did something'},
        //    {id: 2, notice: 'You should do something', link: 'projekter'},
        //    {id: 3, notice: 'Check this out', desc: 'Someone did something and you should know about it'},
        //    {id: 4, notice: 'Something changed', desc: 'Someone did something, check it out', link: 'projekter'}
        // ];


        vm.rmNotice = function(nIndex) {
						notificationsService.delNotice(currentUser, nIndex).then(function(){
							
			        notificationsService.getNotices(currentUser).then (function (val) {
			            vm.notifications = val;
			        });
						});
        };
				
				vm.setRead = function(noticeObj) {
					notificationsService.setReadNotice(currentUser, noticeObj).then(function(){
						console.log("check");
					});
				};

        vm.addNotice = function() {
            vm.popNotice({notice: 'Hey there'});
            vm.notifications.push({notice: 'Hey there'});
        };
        $timeout(vm.addNotice(), 3000);

    };
