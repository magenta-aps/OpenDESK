'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteGroupController', SiteGroupController);


function SiteGroupController($scope, $mdDialog, $mdToast, $translate, siteService, userService) {

    $scope.externalUser = {};
    $scope.searchPeople = searchPeople;
    $scope.addExternalUserToGroup = addExternalUserToGroup;
    $scope.cancel = cancel;
    $scope.updatePDSiteGroups = updatePDSiteGroups;
    $scope.doPDF = doPDF;
    $scope.addMemberToSite = addMemberToSite;
    $scope.removeMemberFromSite = removeMemberFromSite;

    $scope.groupFilter = function (group) {
        if (group[0].multipleMembers) {
            return group;
        }
    };

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    function addExternalUserToGroup (firstName, lastName, email, group) {
        siteService.createExternalUser($scope.site.shortName, firstName, lastName, email, group[0].shortName).then(
            function (response) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Den eksterne bruger, ' + firstName + " " + lastName + ', er blevet oprettet.')
                        .hideDelay(3000)
                );
                $scope.externalUser = {};
                group[1].push({
                    firstName: firstName,
                    lastName: lastName,
                    displayName: firstName + " " + lastName,
                    email: email,
                });
            },
            function (err) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Brugeren kunne ikke oprettes. Tjek at du ikke bruger nogle specielle karakterer i navnet')
                        .hideDelay(3000)
                );
            });
    }

    function cancel() {
        $mdDialog.cancel();
    }

    function updatePDSiteGroups() {
        $mdDialog.cancel();
        $translate('GROUP.UPDATED').then(function (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .hideDelay(3000)
            );
        });
    }

    function doPDF() {
        siteService.createMembersPDF($scope.site.shortName).then(function(response) {
            alfrescoDownloadService.downloadFile("workspace/SpacesStore/" + response[0].Noderef, "Medlemsliste.pdf");

        });
    }

    function addMemberToSite(user, role) {
        var userName = user.userName;
        var siteShortName = $scope.project.shortName;

        siteService.addMemberToSite(siteShortName, userName, role).then(function (response) {
            createSiteNotification(userName, siteShortName);

            for (var i = 0; i < $scope.groups.list.length; i++) {
            if ($scope.groups.list[i][0].role == role) {
                $scope.groups.list[i][1].push(user);
                break;
            }
        }
        });
        $mdDialog.hide();
    };

    function removeMemberFromSite (siteName, user, groupIndex) {
        var userName = user.userName;
        siteService.removeMemberFromSite(siteName, userName).then(function (response) {
            var memberIndex = $scope.groups.list[groupIndex][1].indexOf(user);
            group.splice(memberIndex, 1);
        });
        $mdDialog.hide();
    };
}