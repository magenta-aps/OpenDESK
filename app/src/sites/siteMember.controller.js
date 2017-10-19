'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteMemberController', SiteMemberController);


function SiteMemberController(sitedata, $scope, $mdDialog, $mdToast, $translate, APP_CONFIG, siteService, userService,
                             notificationsService) {
    var vm = this;

    $scope.externalUser = {};
    vm.addExternalUserToGroup = addExternalUserToGroup;
    vm.addMemberToSite = addMemberToSite;
    vm.cancelDialog = cancelDialog;
    vm.groupFilter = groupFilter;
    vm.removeMemberFromSite = removeMemberFromSite;
    vm.searchPeople = searchPeople;
    vm.updatePDSiteGroups = updatePDSiteGroups;
    vm.project = sitedata;


    function groupFilter(group) {
        if (group[0].multipleMembers) {
            return group;
        }
    }

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    function addExternalUserToGroup(firstName, lastName, email, group) {
        siteService.checkIfEmailExists(email).then(function (response) {
            console.log(response.data[0].result);

            if (response.data[0].result == 'false') {
                siteService.createExternalUser(vm.project.shortName, firstName, lastName, email, group[0].shortName).then(
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
                    }
                );
            } else {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Brugeren findes allerede')
                    .hideDelay(3000)
                );
            }
        });
    }

    function cancelDialog() {
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

    function addMemberToSite(user, groupName) {
        var userName = user.userName;
        var siteShortName = vm.project.shortName;

        siteService.addMemberToSite(siteShortName, userName, groupName).then(function (response) {
            createSiteNotification(userName, siteShortName);

            for (var i = 0; i < $scope.groups.list.length; i++) {
                if ($scope.groups.list[i][0].role == groupName) {
                    $scope.groups.list[i][1].push(user);
                    break;
                }
            }
        });
    }

    function removeMemberFromSite(user, groupName) {
        var userName = user.userName;
        siteService.removeMemberFromSite(vm.project.shortName, userName, groupName).then(function (response) {});
    }

    function createNotification(userName, subject, message, link, wtype, project) {
        console.log('creating notification...');
        notificationsService.addNotice(userName, subject, message, link, wtype, project).then(function (val) {});
    }

    function createSiteNotification(userName, site) {
        var subject = "Du er blevet tilføjet til " + vm.project.title;
        var author = $scope.currentUser.firstName + ' ' + $scope.currentUser.lastName;

        var message = author + " har tilføjet dig til projektet " + vm.project.title + ".";
        var link = '#!/' + APP_CONFIG.sitesUrl + '/' + site;
        createNotification(userName, subject, message, link, 'project', site);
    }
}