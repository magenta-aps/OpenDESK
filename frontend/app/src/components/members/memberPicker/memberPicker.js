angular.module('members')
.component('memberPicker', {
  templateUrl: 'app/src/components/members/memberPicker/memberPicker.html',
  controller: memberPicker,
  bindings: {
    selected: '='
  }
});

function memberPicker (siteService, userService) {
  var vm = this;
  var owners = [];

  vm.searchManagers = searchManagers;

  activate();

  function activate() {
    siteService.getAllOwners()
    .then(function (response) {
        owners = response;
      },
      function (err) {
        console.log(err);
      }
    );
  }

  function searchManagers(query) {
    if (query) {
      return userService.getUsers(query);
  }
  }
}