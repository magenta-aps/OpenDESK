angular
  .module('openDeskApp.user')
  .factory('UserService', ['$http', '$window', UserService])

function UserService ($http, $window) {
  var user

  return {
    get: getUser,
    uploadAvatar: uploadAvatar,
    updateAvatar: updateAvatar
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

  function updateAvatar (avatar) {
    var userInfo = angular.fromJson($window.localStorage.getItem('userInfo'))
    userInfo.user.avatar = avatar
    $window.localStorage.setItem('userInfo', angular.toJson(userInfo))
  }
}
