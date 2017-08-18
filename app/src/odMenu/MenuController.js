angular
    .module('openDeskApp.menu')
    .controller('MenuController', MenuController)
    .directive('odMenu', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/odMenu/view/menu.html'
        };
    });

function MenuController(APP_CONFIG) {
    var mc = this;
    mc.landingPageState = APP_CONFIG.landingPageState;

};
