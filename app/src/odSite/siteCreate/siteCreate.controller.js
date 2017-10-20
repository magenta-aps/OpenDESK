'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteCreateController', SiteCreateController);

function SiteCreateController(sitetype, $scope, $state, $mdToast, $translate, $q, $mdDialog, notificationsService, authService, siteService, filterService, userService, APP_CONFIG) {
    var vm = this;

    var currentUser = authService.getUserInfo().user;
    var availOwners = [];

    vm.type = sitetype;

    vm.cancelDialog = cancelDialog;

    $scope.newSite = {
        isPrivate: false,
        manager: currentUser,
        presetManager: currentUser
    };
    vm.availOrgs = [];
    $scope.selectedProjGrpItem = null;
    $scope.srchprjgrptxt = null;
    $scope.selectedStyreGrpItem = null;
    $scope.srchstrgrptxt = null;
    $scope.selectedArbejdsGrpItem = null;
    $scope.srchrbjdgrptxt = null;
    $scope.selectedFolgeGrpItem = null;
    $scope.srchflggrptxt = null;

    vm.searchOwners = searchOwners;
    vm.searchPeople = searchPeople;
    vm.createPdSite = createPdSite;
    vm.createSite = createSite;

    $scope.creating = false;

    activate();

    function activate() {
        loadTemplateNames();
        getOwners();
        getAvailOrgs();
        loadSiteGroups();
    }

    $scope.groupFilter = function (group) {
        if (group.multipleMembers) {
            return group;
        }
    };

    function loadTemplateNames() {
        siteService.getTemplateNames().then(function (templates) {
            $scope.templates = templates;
        });
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function getOwners() {
        siteService.getAllOwners().then(function (owners) {
                availOwners = owners;
            },
            function (err) {
                console.log(err);
            }
        );
    }

    function searchOwners(query) {
        return filterService.search(availOwners, {
            displayName: query
        });
    }

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    function getAvailOrgs() {
        siteService.getAllOrganizationalCenters().then(function (response) {
            vm.availOrgs = response.data;
        });
    }

    function loadSiteGroups() {
        siteService.getSiteGroups(vm.type).then(function (response) {
            $scope.newSite.groups = response;
        });
    }

    function createPdSite() {
        $scope.creating = true;
        if ($scope.newSite.template === undefined || $scope.newSite.template == "no-template") {
            $scope.newSite.template = {
                "name": ""
            };
        }

        var visibility = $scope.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC';

        siteService.createPDSite(
            $scope.newSite.siteName,
            $scope.newSite.desc,
            $scope.newSite.sbsys,
            $scope.newSite.center_id,
            $scope.newSite.owner.userName,
            $scope.newSite.manager.userName,
            visibility,
            $scope.newSite.template.name
        ).then(
            function (response) {

                var siteShortName = response.data[0].shortName;
                var siteName = $scope.newSite.siteName;
                var link = '#!/' + APP_CONFIG.sitesUrl +'/' + siteShortName;

                createSiteNotification(siteName, $scope.newSite.owner.userName, link);
                createSiteNotification(siteName, $scope.newSite.manager.userName, link);

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
                    .textContent('Du har oprettet projekt: ' + $translate.instant('SITES.' + vm.type + '.NAME').toLowerCase() + ' med navnet ' + $scope.newSite.siteName)
                    .hideDelay(3000)
                );
                $scope.creating = false;
            },
            function (err) {
                console.log(err);
                $scope.creating = false;
            }
        );
    }

    function createSite() {
        $scope.creating = true;
        var visibility = "PUBLIC"; // Visibility is set to public
        if ($scope.newSite.isPrivate) {
            visibility = "PRIVATE";
        }

        siteService.createSite($scope.newSite.siteName, $scope.newSite.desc, visibility).then(function (response) {

            var siteShortName = response[0].shortName;
            var siteName = $scope.newSite.siteName;
            var link = '#!/' + APP_CONFIG.sitesUrl +'/' + siteShortName;

            angular.forEach($scope.newSite.groups, function (group) {
                if (group.multipleMembers)
                    addUserToGroup(siteShortName, siteName, group.members, group.shortName, link);
            });

            $state.go('project', {
                projekt: siteShortName
            });
            $mdToast.show(
                $mdToast.simple()
                .textContent('Du har oprettet et nyt ' + $translate.instant('SITES.' + vm.type + '.NAME').toLowerCase() + ' med navnet ' + $scope.newSite.siteName)
                .hideDelay(3000)
            );
            $scope.creating = false;

            $mdDialog.cancel();
        });
    }

    function addUserToGroup(siteShortName, siteName, group, groupName, link) {
        // Creating an empty initial promise that always resolves itself.
        var promise = $q.all([]);

        // Iterating list of items sequential instead of async.
        angular.forEach(group, function (user) {
            var userName = user.userName;
            promise = siteService.addUser(siteShortName, userName, groupName).then(
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
            var subject = "Du er blevet tilføjet til " + siteName;
            var message = "har tilføjet dig til projektet " + siteName + ".";
            notificationsService.addNotice(userName, subject, message, link, 'project', siteName).then(function (val) {
                $mdDialog.cancel();
            });
        }
    }
}