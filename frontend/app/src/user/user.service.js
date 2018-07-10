angular
  .module('openDeskApp.user')
  .factory('UserService', UserService)

function UserService ($http, $window) {
  var user

  return {
    get: getUser,
    uploadAvatar: uploadAvatar
  }

  function getUser () {
    if ($window.localStorage.getItem('userInfo')) {
      user = angular.fromJson($window.localStorage.getItem('userInfo')).user
      return user
    } else { return undefined }
  }

  function uploadAvatar (file) {
    var formData = new FormData()
    formData.append('filedata', file)
    formData.append('username', user.userName)

    var headers = {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }

    return $http.post(`/alfresco/service/slingshot/profile/uploadavatar`, formData, headers)
      .then(function (response) {
        return response
      })
  }
}
