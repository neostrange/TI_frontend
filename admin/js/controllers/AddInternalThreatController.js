app.controller('addInternalCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter) {
	
	$scope.threatform = {};
	$scope.user = {};
	console.log($scope.user);
	
	$scope.submitForm = function(){
		console.log($scope.user);
	};
});


app.controller('addSensorCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter) {
	
	$scope.threatform = {};
	$scope.user = {};
	console.log($scope.user);
	
	$scope.submitForm = function(){
		console.log($scope.user);
	};
});