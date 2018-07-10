angular
  .module('odEmail')
  .service('odEmailService', odEmailService)

function odEmailService ($http) {
  return {
    sendEmail: sendEmail
  }

  function sendEmail (email) {
    return $http.post('/alfresco/service/users', {
      PARAM_METHOD: 'sendEmail',
      PARAM_USERNAME: email.userName,
      PARAM_SUBJECT: email.subject,
      PARAM_BODY: email.body
    }).then(function (response) {
    })
  }
}
