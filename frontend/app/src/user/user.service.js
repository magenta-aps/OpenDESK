// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp.user')
  .factory('userService', ['$http', '$window', userService])

function userService ($http, $window) {
  var user

  return {
    getUser: getUser,
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
