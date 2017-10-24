'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('CreateFromTemplateController', CreateFromTemplateController);

function CreateFromTemplateController(contentType, $scope) {

    var vm = this;

    $scope.contentType = contentType;

    activate();

    function activate() {
        console.log('createFromTemplateController');
    }
}