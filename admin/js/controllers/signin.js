'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state','$cookies','rootURL', function($scope, $http, $state, $cookies, rootURL) {
    $scope.user = {};
    $scope.authError = null;
	
	
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
	  if($scope.user.password == 12345){
		   $scope.authError = "";
		   $cookies.token ="login";
		     $state.go('app.dashboard-v1');
	  }else{
		    $scope.authError = 'Email or Password not right';
	  }
    };
	
	
	
  }])
;