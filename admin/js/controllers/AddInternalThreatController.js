app.controller('addInternalCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster, $timeout) {

	$scope.threatform = {};
	$scope.user = {};
	console.log($scope.user);
		$scope.submitForm = function(){
			ngProgress.start();
			console.log($scope.user);
			crudSrv.createRequest(rootURL.url.baseURL +"crud/create/internal-host", $scope.user ,function(data, status){
			ngProgress.complete();
			$scope.toaster = {
				type: 'success',
				title: 'Host',
				text: 'New Record has been added'
			};
			
			toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
			 console.log(data);
			},function(error){
				 $scope.request = true;
			});
	};
});

app.controller('addSensorCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	
	$scope.threatform = {};
	$scope.user = {};
	$scope.user['geoPoint'] ={}; 
	console.log($scope.user);
	
	$scope.submitForm = function(){
		ngProgress.start();
		console.log($scope.user);
		
			crudSrv.createRequest(rootURL.url.baseURL +"crud/create/sensor", $scope.user ,function(data, status){
			ngProgress.complete();
			$scope.toaster = {
				type: 'success',
				title: 'Host',
				text: 'New Record has been added'
			};
				toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
				console.log(data);
			},function(error){
				 $scope.request = true;
			});
	};
});


app.controller('ListAllSensors', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	// pagination works here for All Attack Lists
		var limit;
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
		
			$scope.pagination = {
				current: 1
			};
			
			$scope.totalCount = 0;
			$scope.totalPerPage = 20; 
			getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
				
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				  ngProgress.start();
				  if( pageNum >= 1){
					  var diff = $scope.totalCount -(pageNum * 20);
					  console.log(diff);
					  if(diff <= 19){
						  limit = diff;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"crud/fetch/sensor?page="+pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();			 
				 $scope.totalCount = data.totalElements;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
});	


app.controller('ListInternalThreats', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	// pagination works here for All Attack Lists
		var limit;
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
		
			$scope.pagination = {
				current: 1
			};
			
			$scope.totalCount = 0;
			$scope.totalPerPage = 20; 
			getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
				
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				  ngProgress.start();
				  if( pageNum >= 1){
					  var diff = $scope.totalCount -(pageNum * 20);
					  console.log(diff);
					  if(diff <= 19){
						  limit = diff;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"crud/fetch/internal-host?page="+pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();			 
				 $scope.totalCount = data.totalElements;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
});		


app.controller('ListInternalThreatsDetected', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	// pagination works here for All Attack Lists
		var limit;
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
		
			$scope.pagination = {
				current: 1
			};
			
			$scope.totalCount = 0;
			$scope.totalPerPage = 20; 
			getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
				
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				  ngProgress.start();
				  if( pageNum >= 1){
					  var diff = $scope.totalCount -(pageNum * 20);
					  console.log(diff);
					  if(diff <= 19){
						  limit = diff;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"crud/fetch/internal-hosts?page="+pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();			 
				 $scope.totalCount = data.totalElements;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
});		