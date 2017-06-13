'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteCreateController', SiteCreateController);

function SiteCreateController($q, $mdDialog, pd_siteService, $state, filterService, siteService, userService, $mdToast) {

    var pdc = this;

    pdc.openSiteCreateDialog = openSiteCreateDialog;

    function openSiteCreateDialog(ev, type) {
        $mdDialog.show({
            controller: SiteCreateDiaglogController,
            templateUrl: 'app/src/sites/view/createSite.tmpl.html',
            locals: {
                sitetype: type
            },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }

    function SiteCreateDiaglogController(sitetype, $scope, notificationsService, authService) {

        var currentUser = authService.getUserInfo().user;
        var availOwners = [];

        $scope.type = sitetype;

        $scope.cancel = cancel;

        $scope.newSite = {
            isPrivate: false,
            manager: currentUser,
            presetManager: currentUser
        };
        $scope.availOrgs = [];
        $scope.selectedProjGrpItem = null;
        $scope.srchprjgrptxt = null;
        $scope.selectedStyreGrpItem = null;
        $scope.srchstrgrptxt = null;
        $scope.selectedArbejdsGrpItem = null;
        $scope.srchrbjdgrptxt = null;
        $scope.selectedFolgeGrpItem = null;
        $scope.srchflggrptxt = null;

        $scope.searchOwners = searchOwners;
        $scope.searchPeople = searchPeople;
        $scope.createPdSite = createPdSite;
        $scope.createSite = createSite;

        loadTemplateNames();
        getOwners();
        getAvailOrgs();
        loadSiteGroups();

        function loadTemplateNames() {

            pd_siteService.getTemplateNames().then(function (response) {

                var result = [];

                for (var i in response) {

                    var shortName = response[i].shortName;
                    var displayName = response[i].title;
                    result.push({
                        "shortName": shortName,
                        "displayName": displayName
                    })
                }

                $scope.templates = result;
            })

        }


        function cancel() {
            $mdDialog.cancel();
        }


        function getOwners() {
            pd_siteService.getAllOwners().then(
                function (response) {
                    console.log(response);
                    availOwners = response;
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
            pd_siteService.getAllOrganizationalCenters().then(
                function (response) {
                    $scope.availOrgs = response.data;
                }
            );
        }

        function loadSiteGroups() {
            siteService.getSiteGroups($scope.type).then(function (response) {
                $scope.newSite.groups = response;
                angular.forEach($scope.newSite.groups, function (group) {
                    group.members = [];
                    if (group.collapsed)
                        group.open = false;
                });
            });
        }

        function createPdSite() {
            if ($scope.newSite.template == undefined || $scope.newSite.template == "no-template") {
                $scope.newSite.template = {
                    "name": ""
                };
            }

            var visibility = $scope.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC';

            pd_siteService.createPDSite(
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
                    var link = "#!/projekter/" + siteShortName;

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
                        .textContent('Du har oprettet projekt: ' + $scope.newSite.siteName)
                        .hideDelay(3000)
                    );
                },
                function (err) {
                    console.log(err);
                }
            );
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
}