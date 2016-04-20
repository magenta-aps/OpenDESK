
    angular
        .module('openDeskApp.menu')
        .controller('MenuController', MenuController)
        .directive('odMenu', function() {
            return {
              restrict: 'E',
              scope: {},
              templateUrl: '/app/src/odMenu/view/menu.html'
            };
        });

    function MenuController($scope, $timeout, $log) {
        var vm = this;
        
        vm.toggleNotices = buildToggler('notice');
        
        vm.close = function () {
            $mdSidenav('notice').close()
            .then(function () {
                $log.debug("close notifications is done");
            });
        };
        
        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        };
        
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildDelayedToggler(navID) {
            return debounce(function() {
              $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
            }, 200);
        };
        function buildToggler(navID) {
            return function() {
                $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
            };
        };

    };
