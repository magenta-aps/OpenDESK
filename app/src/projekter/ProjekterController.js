angular
    .module('openDeskApp.projekter')
    .controller('ProjekterController', ProjekterController);

function ProjekterController($scope) {
    var vm = this;
		var projectsArr = ['Projekt 1', 'Projekt 2', 'Projekt 3', 'Projekt 4', 'Projekt 5', 'Projekt 7', 'Projekt 8', 'Projekt 9', 'Projekt 10', 'Projekt 11', 'Projekt 12', 'Projekt 13', 'Projekt 14'];
		
		vm.projects = projectsArr;
}