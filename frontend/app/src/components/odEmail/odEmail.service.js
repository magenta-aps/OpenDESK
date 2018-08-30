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
