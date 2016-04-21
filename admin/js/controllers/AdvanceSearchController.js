app.controller('advancedSearchCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster, $timeout) {

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if (phase == '$apply' || phase == '$digest') {
			if (fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
	
	
	$scope.threatform = {};
	$scope.user = {};
	 $scope.person = {};
	 $scope.peoples = [
    { name: 'Adam',      email: 'adam@email.com',      age: 10 },
    { name: 'Amalie',    email: 'amalie@email.com',    age: 12 },
    { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30 },
    { name: 'Samantha',  email: 'samantha@email.com',  age: 31 },
    { name: 'Estefanía', email: 'estefanía@email.com', age: 16 },
    { name: 'Natasha',   email: 'natasha@email.com',   age: 54 },
    { name: 'Nicole',    email: 'nicole@email.com',    age: 43 },
    { name: 'Adrian',    email: 'adrian@email.com',    age: 21 }
  ];
  
  
	console.log($scope.peoples);
	 
	/* 
	$scope.people = [
    { name: 'Adam',      email: 'adam@email.com',      age: 10 },
    { name: 'Amalie',    email: 'amalie@email.com',    age: 12 },
    { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30 },
    { name: 'Samantha',  email: 'samantha@email.com',  age: 31 },
    { name: 'Estefanía', email: 'estefanía@email.com', age: 16 },
    { name: 'Natasha',   email: 'natasha@email.com',   age: 54 },
    { name: 'Nicole',    email: 'nicole@email.com',    age: 43 },
    { name: 'Adrian',    email: 'adrian@email.com',    age: 21 }
  ];
  
   */
  
  
  $scope.multipleDemo = {};
  $scope.multipleDemo.atck = {};
   $scope.multipleDemo.selectedPeople = [$scope.people[5], $scope.people[4]];
  $scope.attacks = [
    { name: 'Reconnaissance',  val:'probing' },
    { name: 'Malware',  val:'malware'},
    { name: 'SSH',  val: 'ssh' },
    { name: 'DataBase', val:'db' },
    { name: 'Sip', val:'sip' },
    { name: 'web',   val: 'web'}
	
  ];
    $scope.attacks= JSON.parse($scope.attacks);
  $scope.safeApply();
  
});