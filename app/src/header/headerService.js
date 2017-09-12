angular
    .module('openDeskApp')
    .factory('headerService', headerService);

function headerService() {

    var vm = this;

    var currentTitle = 'hello world';
    
    vm.setTitle = function (title) {
        currentTitle = title;
    };

    vm.getTitle = function() {
        return currentTitle;
    }

    return vm;
}