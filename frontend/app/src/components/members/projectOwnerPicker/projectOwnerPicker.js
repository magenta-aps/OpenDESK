angular.module('members')
.component('projectOwnerPicker', {
  templateUrl: '/app/src/components/members/projectOwnerPicker/projectOwnerPicker.html',
  controller: projectOwnerPicker,
  bindings: {
    selected: '=',
    type: '<'
  }
});

function projectOwnerPicker (siteService, filterService) {
  var vm = this;
  var owners = [];

  vm.searchOwners = searchOwners;

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

  function searchOwners(query) {
    return filterService.search(owners, {
        displayName: query
    });
  }
}