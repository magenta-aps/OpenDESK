'use strict'

angular
  .module('openDeskApp.site')
  .controller('EditSiteMemberController', ['sitedata', '$scope', '$mdDialog', '$mdToast', 'APP_CONFIG', 'siteService',
    'MemberService', 'notificationsService', 'UserService', EditSiteMemberController])

function EditSiteMemberController (sitedata, $scope, $mdDialog, $mdToast, APP_CONFIG, siteService, MemberService,
  notificationsService, UserService) {
  var vm = this

  $scope.externalUser = {
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    group: ''
  }
  vm.ssoLoginEnabled = APP_CONFIG.ssoLoginEnabled
  vm.addExternalUserToGroup = addExternalUserToGroup
  vm.addMemberToSite = addMemberToSite
  vm.cancelDialog = cancelDialog
  vm.groupFilter = groupFilter
  vm.groups = []
  vm.removeMemberFromSite = removeMemberFromSite
  vm.saveChanges = saveChanges
  vm.searchPeople = searchPeople
  vm.site = sitedata
  vm.user = UserService.get()
  vm.showSendEmailDialog = showSendEmailDialog

  activate()

  function activate () {
    siteService.getGroupsAndMembers(vm.site.shortName).then(function (groups) {
      vm.groups = groups
    })
  }

  function saveChanges () {
    siteService.updateMemberList()
    cancelDialog()
  }

  function groupFilter (group) {
    if (group[0].multipleMembers)
      return group
  }

  function searchPeople (query) {
    if (query)
      return MemberService.search(query)
  }

  function addExternalUserToGroup (userName, firstName, lastName, email, telephone, group) {
    MemberService.validate(userName, email)
      .then(function (response) {
        if (response.isValid) {
          MemberService.addExternal(vm.site.shortName, userName, firstName, lastName, email, telephone,
            group[0].shortName).then(
            function (response) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Den eksterne bruger, ' + firstName + ' ' + lastName + ', er blevet oprettet.')
                  .hideDelay(3000)
              )
              $scope.externalUser = {}
              group[1].push({
                firstName: firstName,
                lastName: lastName,
                displayName: firstName + ' ' + lastName,
                email: email
              })
              showSendEmailDialog(response.userName, response.subject, response.body)
            },
            function () {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Brugeren kunne ikke oprettes. Tjek at du ikke bruger nogle specielle karakterer i navnet')
                  .hideDelay(3000)
              )
            }
          )
        } else {
          var msg = 'Brugeren blev ikke valideret.'
          if (response.emailExists)
            msg = 'Emailen er allerede i brug.'
          if (response.userNameExists)
            msg = 'Brugernavnet er allerede i brug.'
          $mdToast.show(
            $mdToast.simple()
              .textContent(msg)
              .hideDelay(3000)
          )
        }
      })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function addMemberToSite (user, groupName) {
    var userName = user.userName
    var siteShortName = vm.site.shortName

    MemberService.add(siteShortName, userName, groupName)
      .then(function () {
        createSiteNotification(userName, siteShortName)

        for (var i = 0; i < vm.groups.length; i++)
          if (vm.groups[i][0].role === groupName) {
            vm.groups[i][1].push(user)
            break
          }
      })
  }

  function removeMemberFromSite (user, groupName) {
    MemberService.remove(vm.site.shortName, user.userName, groupName)
  }

  function createNotification (userName, subject, message, link, wtype, project) {
    notificationsService.add(userName, subject, message, link, wtype, project)
  }

  function createSiteNotification (userName, site) {
    var subject = 'Du er blevet tilføjet til ' + vm.site.title
    var author = vm.user.firstName + ' ' + vm.user.lastName

    var message = author + ' har tilføjet dig til projektet ' + vm.site.title + '.'
    var link = APP_CONFIG.sitesUrl + '/' + site
    createNotification(userName, subject, message, link, 'project', site)
  }

  function showSendEmailDialog (userName, subject, body) {
    var email = {
      userName: userName,
      subject: subject,
      body: body
    }

    $mdDialog.show({
      locals: { email: email },
      controller: ['$scope', 'email', function ($scope, email) {
        $scope.email = email
      }],
      template: '<od-email-send email="email" is-loaded="isLoaded"></od-email-send>',
      onComplete: function (scope) {
        scope.isLoaded = true
      }
    })
  }
}
