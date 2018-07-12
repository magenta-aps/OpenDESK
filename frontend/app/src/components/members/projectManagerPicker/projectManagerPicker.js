angular.module('openDeskApp.members')
  .component('projectManagerPicker', {
    templateUrl: 'app/src/components/members/projectManagerPicker/projectManagerPicker.html',
    controller: projectManagerPicker,
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectManagerPicker (siteService, MemberService) {
  var vm = this

  vm.searchManagers = searchManagers

  function searchManagers (query) {
    if (query)
      return MemberService.search(query)
  }
}
