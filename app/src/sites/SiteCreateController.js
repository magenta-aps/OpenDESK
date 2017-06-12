'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteCreateController', SiteCreateController);

function SiteCreateController($q, $mdDialog, $state, filterService, siteService, userService, $mdToast) {

    var sc = this;

    sc.openSiteCreateDialog = openSiteCreateDialog;

    function openSiteCreateDialog(ev) {
        $mdDialog.show({
            controller: SiteCreateDialogController,
            templateUrl: 'app/src/sites/view/newProject.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }

    function SiteCreateDialogController($scope, notificationsService, authService) {

        var currentUser = authService.getUserInfo().user;

        $scope.cancel = cancel;

        $scope.newSite = {
            isPrivate: false,
        };

        $scope.searchPeople = searchPeople;
        $scope.createSite = createSite;

        loadSiteGroups();

        function cancel() {
            $mdDialog.cancel();
        }

        function searchPeople(query) {
                if (query) {
                    return userService.getUsers(query);
                }
            }

        function loadSiteGroups() {
            siteService.getSiteGroups("Project").then(function (response) {
                $scope.newSite.groups = response;
                angular.forEach($scope.newSite.groups, function (group) {
                    group.members = [];
                    if (group.collapsed)
                        group.open = false;
                });
            });
        }

        function createSite() {

            var visibility = "PUBLIC"; // Visibility is set to public
            if ($scope.newSite.isPrivate) {
                visibility = "PRIVATE";
            }

            siteService.createSite($scope.newSite.siteName, $scope.newSite.desc, visibility).then(function (response) {

                var siteShortName = response[0].shortName;
                var siteName = $scope.newSite.siteName;
                var link = "#!/projekter/" + siteShortName;

                angular.forEach($scope.newSite.groups, function (group) {
                    if (group.multipleMembers)
                        addUserToGroup(siteShortName, siteName, group.members, group.shortName, link);
                });

                $mdDialog.cancel();
                $state.go('project', {
                    projekt: siteShortName
                });
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Du har oprettet grupperummet: ' + $scope.newSite.siteName)
                    .hideDelay(3000)
                );

                $mdDialog.hide();
            });
        }

        function addUserToGroup(siteShortName, siteName, group, groupName, link) {
            // Iterating list of items sequential instead of async.
            angular.forEach(group, function (user) {
                var userName = user.userName;
                siteService.addUser(siteShortName, userName, groupName).then(
                    function (response) {
                        createSiteNotification(siteName, userName, link);
                        console.log('Added user ' + userName + ' to ' + groupName + ' in project ' + siteName);
                    },
                    function (err) {
                        console.log('ERROR: Problem creating user in project group ' + groupName);
                        console.log(err);
                    }
                );
            });
        }

        function createSiteNotification(siteName, userName, link) {
            if (userName !== currentUser.userName) {
                var author = currentUser.firstName + ' ' + currentUser.lastName;
                var subject = "Du er blevet tilføjet til " + siteName;
                var message = author + " har tilføjet dig til grupperummet " + siteName + ".";
                notificationsService.addNotice(userName, subject, message, link, 'project', siteName).then(function (val) {
                    $mdDialog.cancel();
                });
            }
        }
    }
}