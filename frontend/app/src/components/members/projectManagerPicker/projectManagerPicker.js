angular.module('members')
.component('projectManagerPicker', {
  templateUrl: 'app/src/components/members/projectManagerPicker/projectManagerPicker.html',
  controller: projectManagerPicker,
  bindings: {
    selected: '=',
    type: '<'
  }
});

function projectManagerPicker (siteService, member) {
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
      return member.search(query);
  }
  }
}