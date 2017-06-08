'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteGroupEditController', PdSiteGroupEditController);
    
    function PdSiteGroupEditController(sitedata, $scope, $mdDialog, siteService, $mdToast, pd_siteService, authService, notificationsService) {
        
        var pdg = this;
        
        pdg.site = sitedata;

        //$scope.cancel = cancel;
        //$scope.updatePDSiteGroups = updatePDSiteGroups;
        //$scope.searchPeople = searchPeople;
        $scope.addMember = addMember;
        $scope.removeMember = removeMember;
        //$scope.addExternalUserToGroup = addExternalUserToGroup;

        var user = authService.getUserInfo().user;
        var currentUser = user.userName;

        /*
        function addExternalUserToGroup (firstName, lastName, email, groupName) {
            pd_siteService.createExternalUser(pdg.site.shortName, firstName, lastName, email, groupName).then(
                function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Den eksterne bruger, ' + firstName + " " + lastName + ', er blevet oprettet.')
                            .hideDelay(3000)
                    );
                    // TODO: REPLACE $scope.groups[groupName].push({displayName: firstName + " " + lastName});
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
        
        function searchPeople(query) {
            if (query) {
                return siteService.getAllUsers(query);
            }
        }
         */
        
        
        function addMember(member, group) {
            siteService.addUser( pdg.site.shortName, member.userName, group ).then(
                function(response) {
                    var link = "#!/projekter/" + pdg.site.shortName;
                    createSiteNotification(pdg.site.title, member.userName, link);
                },
                function(err) {
                    console.log('ERROR: Problem creating user ' + member.userName + ' in project group ' + group);
                    console.log(err);
                }
            );
        }
        
        
        function removeMember(member, group) {
            siteService.removeUser( pdg.site.shortName, member.userName, group ).then(

                function(response) {
                },
                function(err) {
                    console.log('ERROR: Problem removing user ' + member.userName + ' from project group ' + group);
                    console.log(err);
                }
            );   
        }
        
        /*
        function updatePDSiteGroups() { 
            $mdDialog.cancel();
            $mdToast.show(
                $mdToast.simple()
                        .textContent('Grupper er opdateret')
                        .hideDelay(3000)
            );
        }
*/

        function createSiteNotification (siteName, userName, link) {
            if(userName !== currentUser) {
                var subject = "Du er blevet tilføjet til " + siteName;
                var message = "har tilføjet dig til projektet " + siteName + ".";
                notificationsService.addNotice(userName, subject, message, link,'project', siteName).then(function (val) {
                });
            }
        }

        
    }
