angular.module('members')
.component('projectManagerPicker', {
  templateUrl: 'app/src/components/members/projectManagerPicker/projectManagerPicker.html',
  controller: projectManagerPicker,
  bindings: {
    selected: '=',
    type: '<'
  }
});

function projectManagerPicker (siteService, userService) {
  var vm = this;
  var owners = [];

  vm.searchManagers = searchManagers;

  activate();

  function activate() {
    siteService.getAllOwners()
    .then(response => {
        owners = response;
      },
      err => {
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