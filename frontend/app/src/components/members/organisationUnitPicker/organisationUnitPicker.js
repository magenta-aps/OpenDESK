angular.module('members')
.component('organisationUnitPicker', {
  templateUrl: '/app/src/components/members/organisationUnitPicker/organisationUnitPicker.html',
  controller: organisationUnitPicker,
  bindings: {
    selected: '=',
    type: '<'
  }
});

function organisationUnitPicker (siteService) {
  var vm = this;
  vm.organisationUnits = [];

  activate();

  function activate() {
    siteService.getAllOrganizationalCenters()
    .then(function (response) {
      vm.organisationUnits = response.data;
      }, function (err) {
        console.log(err);
      }
    );
  }
}