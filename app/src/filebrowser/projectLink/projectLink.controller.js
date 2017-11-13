'use strict';

angular
.module('openDeskApp.filebrowser')
.controller('ProjectLinkController', ProjectLinkController);

function ProjectLinkController(projectLinkService) {

    var vm = this;

    vm.createProjectLink = createProjectLink;

    function createProjectLink(source, destination) {
        projectLinkService.createProjectLink(source.shortName, destination.shortName).then(function () {
            //hideDialogAndReloadContent();
        });
    }

    function deleteProjectLink(source, destination) {
        projectLinkService.deleteProjectLink(source.shortName, destination.shortName).then(function () {
            //hideDialogAndReloadContent();
        });
    }
}



