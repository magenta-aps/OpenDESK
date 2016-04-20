'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SitesController', SitesController);
        
        function SitesController($scope, $mdDialog) {
					
					$scope.getSites = function(event) {

					// var confirm = $mdDialog.prompt()
	// 				          .title('Create new site')
	// 				          .textContent('Here we need site name and description.')
	// 				          .placeholder('Name')
	// 				          .ariaLabel('Site name')
	// 				          .targetEvent(event)
	// 				          .ok('Create')
	// 				          .cancel('Cancel');
	// 				    $mdDialog.show(confirm).then(function(result) {
	// 				      $scope.status = 'New site created!';
	// 				    }, function() {
	// 				      $scope.status = 'Did not create new site.';
	// 				    });	

	    $mdDialog.show({
	      templateUrl: 'app/src/sites/view/newProject.tmpl.html',
	      targetEvent: event,
	      clickOutsideToClose:true	    
			})
	    .then(function(answer) {
	      $scope.status = 'You said the information was .';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
								
					
					
					
					};
        };
        