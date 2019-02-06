// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('odEmail')
  .service('odEmailService', ['$http', odEmailService])

function odEmailService ($http) {
  return {
    sendEmail: sendEmail
  }

  function sendEmail (email) {
    return $http.post('/alfresco/service/email', email)
      .then(function (response) {
      })
  }
}
