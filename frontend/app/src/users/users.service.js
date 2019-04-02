angular
  .module('openDeskApp.users')
  .factory('usersService', ['$http', '$window', UsersService])

function UsersService ($http, $window) {
  return {
    // getCurrentUser: getCurrentUser,
    deleteUser: deletePerson,
    getPerson: getPerson,
    getPeople: getPeople,
    getHome: getHome,
    getUserInfo: getUserInfo,
    createUser: createUser,
    updateUser: updateUser,
    getPersons: getPersons,
    getGroups: getGroups,
    changePassword: changePassword,
    uploadUsersCSVFile: uploadUsersCSVFile,
    getUser: getUser,
    uploadAvatar: uploadAvatar,
    updateAvatar: updateAvatar
  }

  var user

  // function getCurrentUser () {
  //   return $http.get('/api/openesdh/currentUser').then(function (response) {
  //     return response.data
  //   })
  // }

  function deletePerson (userName) {
    return $http.delete('/api/people/' + userName).then(function (response) {
      return response.data
    })
  }

  function getPerson (username) {
    return $http.get('/api/people/' + username).then(function (response) {
      return response.data
    })
  }

  function getHome () {
    return $http.get('/api/nodelocator/userhome').then(function (response) {
      return response.data.data
    })
  }

  function getUserInfo (userName) {
    return $http.get('/api/people/' + userName).then(function (response) {
      return response.data
    })
  }

  function createUser (userObj) {
    return $http.post('/api/people', userObj).then(function (response) {
      return response.data
    })
  }

  function updateUser (userObj) {
    return $http.put('/api/people/' + userObj.userName, userObj).then(function (response) {
      return response.data
    })
  }

  function changePassword (user) {
    return $http.put('/api/person/changepassword/' + encodeURIComponent(user.userName),
      user
    ).then(function (response) {
      console.log('Changing Password')
      return response.data
    })
  }

  function getPeople (filter) {
    return $http.get('/api/people' + filter).then(function (response) {
      return response.data
    })
  }

  function getPersons (searchTerm) {
    var url = '/api/forms/picker/authority/children?selectableType=cm:person'
    if (searchTerm && searchTerm.length > 0)
      url += '&searchTerm=' + searchTerm

    return $http.get(url).then(function (result) {
      return result.data.data.items
    })
  }

  function getGroups (searchTerm) {
    var url = '/api/forms/picker/authority/children?selectableType=cm:authorityContainer'
    if (searchTerm && searchTerm.length > 0)
      url += '&searchTerm=' + searchTerm

    return $http.get(url).then(function (result) {
      return result.data.data.items
    })
  }

  function uploadUsersCSVFile (file) {
    var formData = new FormData()
    formData.append('filedata', file)
    formData.append('filename', file.name)

    return $http.post('/api/people/upload', formData, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).then(function (response) {
      return response.data
    })
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
