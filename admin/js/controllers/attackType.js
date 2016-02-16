app.controller('DetailCountryIpsCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, $anchorScroll) {
	$scope.message = 'Global Data Analysis';
	ngProgress.start();
	
	$scope.heading = "Global Threat";
	$scope.mar = [];
	$scope.markers = [];
		var lat, longs;
		var gd1 = undefined; var gd2 = undefined;
	var ip = "58.65.179.176";
	$scope.view = "country";
	$scope.countryName = $stateParams.cName;
	$scope.stateCode = $stateParams.cCode;
	$scope.flag = $scope.stateCode.toLowerCase();
	console.log($scope.stateCode);
	$scope.date ={};
	$scope.d_one_error = { today: false, date_two :false };
	$scope.d_two_error = { today: false , date_one : false};
		$scope.onD1Set = function (newDate,oldDate) {
			console.log(newDate);		
			var d = new Date();
			if(newDate >= d){
			  $scope.d_one_error.today = true;
			}else
			{
				$scope.d_one_error.today = false;
				if($scope.date.endDate != undefined){
					if(newDate >= $scope.date.endDate){
						 $scope.d_one_error.date_two = true;
					}else{
						 $scope.d_one_error.date_two = false;
					}
				}
			}	
		};
	
		$scope.onD2Set = function (newDate,oldDate) {
			console.log(newDate);		
			var d = new Date();
			if(newDate >= d){
			  $scope.d_two_error.today = true;
			}else
			{
				$scope.d_two_error.today = false;
				if($scope.date.startDate != undefined){
					if(newDate <= $scope.date.startDate){
						 $scope.d_two_error.date_one = true;
					}else{
						$scope.d_two_error.date_one = false;
						$scope.d_one_error.date_two =false ;
					}
				}
				
			}	
		};
	
		$scope.reload = function(){
			 $state.go("app.CountryIps", {cName: $scope.countryName, cCode:$scope.stateCode},{reload:true});
		};
	
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
	
		crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attack-counts?size=10",function(data, status){
			ngProgress.complete();
		//	console.log(data);
			getAttackTypes(data);
		}, function(error){
			console.log(error);
		});
	
	 function getAttackTypes(data)
	 {
		 $scope.country = [];
						var count = 0;
						$scope.country['attackTypes'] = [];
						
						data.forEach(function(elem,i){
						if(elem.hasOwnProperty('total')){
							$scope.country['attacks'] = elem['total'];
						}else{	
						
						//	console.log($scope.country['attackTypes']['attacks']);	
							$scope.country['attackTypes'].push({exploit:elem.category, hits:elem.hits});	
							}
						});
		};
	 
			 $scope.searchDate = function(){
					var d = new Date($scope.date.startDate);
					var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
					var d1 = utilityMethods.addTInDateTime(a);
				//	console.log(d1, $scope.date.startDate);
					var dd = new Date($scope.date.endDate);
					var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
					var d2 = utilityMethods.addTInDateTime(a2);
				//	console.log(d2);
					gd1 = d1;
					gd2 = d2;
					crudSrv.getResults(rootURL.url.baseURL +"global/country/"+$scope.stateCode+"/attack-counts?size=10&from="+d1+"&to="+d2,function(data, status){
						$scope.countries,$scope.obj = undefined;
						getAttackTypes(data);	
					}, function(error){
						console.log(error);
					});
					
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/all/ip-geopoints?size=100&from="+d1+"&to="+d2,function(data, status){
				console.log(data);
						$scope.mar = [];
						data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.mar.push(obj);
						});
							$scope.markers = $scope.mar;
					console.log($scope.markers);
					var lat = parseFloat($scope.markers[1]['lat']);
					var lon = parseFloat($scope.markers[1]['lng']);
					$scope.center = {
							lat: lat,
							lng: lon,
							zoom: 4
							};	
			}, function(error){
				console.log(error);
			});
				
			};
	 
				angular.extend($scope, {
		center: {
			lat: 39.928894,
			lng: 22.35,
			zoom: 10
		},
		layers:{ baselayers: {
			  googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                }
              
            },defaults:{
				scrollWheelZoom: false
			}
		}
		});	
		
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/all/ip-geopoints?size=100",function(data, status){
				console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
				//	console.log($scope.markers);
						if($scope.markers.length > 1){
					var lat = parseFloat($scope.markers[1]['lat']);
					var lon = parseFloat($scope.markers[1]['lng']);
					$scope.center = {
							lat: lat,
							lng: lon,
							zoom: 4
							};
					}							
			}, function(error){
				console.log(error);
			});		
			
			
			
			// pagination works here for All Attack Lists  
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/all/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
			
	   
	
	var ip = "58.65.179.176";
	$scope.view = "country";
	$scope.countryName = $stateParams.cName;
	//alert($scope.countryName);
		
	$scope.$on("leafletDirectiveMarker.click", function(event, args) {
		console.log(event);
		console.log(args);
		var title = args['model']['label']['message'];

		$state.go("app.showIp", {
			ID: $scope.countryName,
			IP: title
		});
	});
	
	
	
	
	$scope.changeView = function (view, hit){
		console.log(view);
			console.log(hit);
			if(hit >= 1){
			if(view == 'Reconnaissance'){
				$scope.rec(view);
			}
			//$scope.rec(view);
			if(view == "SSH Attacks"){
				$scope.sshAttacks(view);
			}
		    if(view == 'Database Attacks')
				$scope.dbAttacks(view);
			if(view == 'Application Exploit Attempts')
				$scope.applicationAttempt(view);
			if(view == 'Malware Infection')
				$scope.showvirusMap(view);
			
			if(view == 'DOS Attacks'){
				$scope.dosAttacks(view);
			}			
			if(view == 'Network Policy Violation'){
				$scope.networkPolicyViolation(view);
			}
			
			if(view == 'Possible Compromise'){
				$scope.possibleCompromise(view)
			}
			
			};
			
		}
		
		
			/*
	*   function Policy compromise logic here 
	*/
	$scope.possibleCompromise= function(rec){
		$scope.view = "compromise";
		ngProgress.start();
		$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
		$scope.layers = {
			baselayers: {
			  googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                }
			}
		};
		
		$scope.markers = [];
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-compromise/ip-geopoints?size=150&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}	
					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-compromise/ip-geopoints?size=150",function(data, status){
				console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
		//	console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
		
			// pagination works here for All Attack Lists  net-compromise
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-compromise/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
		
	};	
		
		
		
		/*
	*   function complete network policy logic here 
	*/
	$scope.networkPolicyViolation = function(rec){
		$scope.view = "policy";
		ngProgress.start();
		$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
		$scope.layers = {
			baselayers: {
			  googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                }
			}
		};
		
		$scope.markers = [];
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-policy/ip-geopoints?size=150&from="+gd1+"&to="+gd2,function(data, status){
					//console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}	
					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-policy/ip-geopoints?size=150",function(data, status){
				console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}
		
			// pagination works here for All Attack Lists  net-policy
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-policy/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
		//	console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
	};	
		
		
	/*
	*   function complete Dos Attack logic here 
	*/
	$scope.dosAttacks = function(rec){
		$scope.view = "dos";
		ngProgress.start();
		$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
		$scope.layers = {
			baselayers: {
			  googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                }
			}
		};
		
		$scope.markers = [];
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-dos/ip-geopoints?size=150&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}	
					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/net-dos/ip-geopoints?size=150",function(data, status){
				//console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
		
		// pagination works here for All Attack Lists  net-Dos
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-dos/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
		
		
	};	
		
		
	
	/*
	*  Reconn function complete logic here 
	*/
	$scope.rec = function(rec){
		$scope.view = "rec";
		ngProgress.start();
		$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
		$scope.layers = {
			baselayers: {
			  googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                }
			}
		};
		
		$scope.markers = [];
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/probing/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
					//console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}	
					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/probing/ip-geopoints?size=100",function(data, status){
				//console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
		
		// pagination works here for All Attack Lists  REC
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
		
		
	};
	
	
	/*
	*  SSH function complete logic here 
	*/
	$scope.sshAttacks = function(rec){
		$scope.view = "ssh";
		//console.log(gd1, gd2);
		ngProgress.start();
			$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			$scope.layers = {
			baselayers: {
					cycle: {
                            name: 'OpenCycleMap',
                            type: 'xyz',
                            url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                            layerOptions: {
                                subdomains: ['a', 'b', 'c'],
                                attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                continuousWorld: true
                            }
                        },
				googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
				
				
			}
		};
		
	
		if(gd1 != undefined && gd2 != undefined){
			// withDate Time summary	
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					$scope.ssh = data;
					getSshSummary(data);
				
			}, function(error){
				console.log(error);
			});
			
			// withDate Time usernames	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/username?size=100&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					getUsername(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time passwords	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/password?size=10&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					getPassword(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time inputs	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/input?size=10&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					getInput(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time Combination
			crudSrv.getResults(rootURL.url.baseURL +"/attacks/ssh/credentials?size=10&from="+gd1+"&to="+gd2+"&cc="+$scope.stateCode,function(data, status){
				//	console.log(data);
					getCombination(data);
			}, function(error){
				console.log(error);
			});
			
			}else{
				// without dateTime ssh summary 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/summary?size=10",function(data, status){
			//	console.log(data);
				getSshSummary(data);
				$scope.ssh = data;	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh username 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/usernames?size=10",function(data, status){
			//	console.log(data);
				getUsername(data);	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh password 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/passwords?size=10",function(data, status){
			//	console.log(data);
				getPassword(data);	
				}, function(error){
				console.log(error);
				});
				
				
				// without dateTime ssh input 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/inputs?size=10",function(data, status){
			//	console.log(data);
					getInput(data);	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh Combination 
				crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/credentials?size=10&cc="+$scope.stateCode,function(data, status){
			//	console.log(data);
					getCombination(data);	
				}, function(error){
				console.log(error);
				});
			
			}
			
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
				//	console.log($scope.markers);
						if($scope.markers.length > 1){
					var lat = parseFloat($scope.markers[1]['lat']);
					var lon = parseFloat($scope.markers[1]['lng']);
					$scope.center = {
							lat: lat,
							lng: lon,
							zoom: 4
					};
					}					
					ngProgress.complete();
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/ip-geopoints?size=100",function(data, status){
			//	console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
				//	console.log($scope.markers);
						if($scope.markers.length > 1){
					var lat = parseFloat($scope.markers[1]['lat']);
					var lon = parseFloat($scope.markers[1]['lng']);
					$scope.center = {
							lat: lat,
							lng: lon,
							zoom: 4
							};	
						}
			}, function(error){
			console.log(error);
			});
			}
		
		
			function getSshSummary(sumary){
			//Password object
			$scope.sshSummary = [];
			$scope.sshSummaryLabel = [];
			
			sumary.forEach(function(elem,i) {
				$scope.sshSummary.push([
					elem['category'],
					parseInt(elem['hits'])
				]);
				
			$scope.sshSummaryLabel.push(elem['category']);
			});
			
		$scope.chartSeries = [{
			name: "SSH Summary",
			colorByPoint: true,
			data: $scope.sshSummary
		}];
		
			$scope.sshSummaryConfig = utilityMethods.chartLine($scope.chartSeries, 'SSH Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.sshSummaryLabel);
		
		};
		
		
		
		function getPassword (passwords){
			//Password object
			$scope.passwords = [];
			$scope.passwordLabel = [];
			console.log($scope.passwords);
			passwords.forEach(function(elem,i) {
			$scope.passwords.push([
				elem['password'],
				parseInt(elem['hits'])
			]);
			$scope.passwordLabel.push(elem['password']);
			});
		//console.log($scope.passwords);
		$scope.chartSeries = [{
			name: "Passwords",
			colorByPoint: true,
			data: $scope.passwords
		}];
		$scope.passwordConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Passwords Used', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.passwordLabel);
		};
		
		//Usernames object
		
		function getUsername (username){
		$scope.usernames = [];
		$scope.userLabel =[];
		
		username.forEach(function(elem, i) {
			$scope.usernames.push([
				elem['username'],
				parseInt(elem['hits'])
			]);
			
			$scope.userLabel.push(elem['username']);
		});
		
		
		console.log($scope.usernames);
		$scope.chartSeries = [{
			name: "UserNames ",
			colorByPoint: true,
			data: $scope.usernames
		}];
		$scope.userNameConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top UserName Used', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.userLabel);
		};
		
		//Inputs object
		function getInput(inputs){
		$scope.inputs = [];
		$scope.inputLabel = [];			
		inputs.forEach(function(elem, i) {
			$scope.inputs.push([
				elem['input'],
				parseInt(elem['hits'])
			]);
			$scope.inputLabel.push(elem['input']);
		});
		
		console.log($scope.inputs);
		$scope.chartSeries = [{
			name: "Inputs",
			colorByPoint: true,
			data: $scope.inputs
		}];
		$scope.inputConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Input Attack','<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.inputLabel);
	
		};
        		
		function getCombination(data){
		
			ngProgress.complete();
			$scope.userPassword = [];
		//	console.log(data);
			$scope.userPassword = data;
		//Combination of passwords and Usernames
		$scope.combination = [];
		$scope.ob = [];
		$scope.userPassword.forEach(function(elem, i) {
			$scope.combination.push([
				elem['username']+ ":"+elem['password'],
				parseInt(elem['hits'])
			]);
		});
		console.log($scope.combination);
		$scope.chartSeries = [{
			name: "Username & Passwords",
			colorByPoint: true,
			data: $scope.combination
		}];
		$scope.combinationConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Username & Passwords', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false);
		};
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
		//	console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
			// pagination works here for All Attack Lists  ssh
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				 
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
	
	};
	
	
	/*
	*  DB function complete logic here 
	*/
	$scope.dbAttacks = function(rec){
		$scope.view = "db";
		$scope.markers = [];
		ngProgress.start();
			$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
			$scope.layers = {
			baselayers: {
				mapbox_light: {
					name: 'Mapbox Light',
					url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
					type: 'xyz',
					layerOptions: {
						apikey: 'pk.eyJ1Ijoic2FtaTE2MTYiLCJhIjoiY2loeWY3eGxoMDNzYnQzbTF0bXBidWl2ZSJ9.zPBRQZ_zPlcW5lAnEamzZA',
						mapid: 'mapbox.light'
					}
				},
				osm: {
					name: 'OpenStreetMap',
					url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					type: 'xyz'
				}
			}
		};
		
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
			//		console.log(data);
					$scope.db = data;
					getDBSummary(data);
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/summary?size=10",function(data, status){
				console.log(data);
				//$scope.db = data;
				getDBSummary(data);
				ngProgress.complete();	
			}, function(error){
			console.log(error);
			});
			}
		
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}	
					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=100",function(data, status){
			//	console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}
			
			function getDBSummary(sumary){
			//	console.log(sumary);
			//DB object
				$scope.dbSummary = [];
				$scope.dbSummaryLabel = [];
				sumary.forEach(function(elem,i) {
				$scope.dbSummary.push([
					elem['category'],
					parseInt(elem['hits'])
				]);
				
			$scope.dbSummaryLabel.push(elem['category']);
			});
			
		$scope.chartSeries = [{
			name: "Database Summary",
			colorByPoint: true,
			data: $scope.dbSummary
		}];
		
			$scope.dbSummaryConfig = utilityMethods.chartLine($scope.chartSeries, 'Database Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.dbSummaryLabel);
		
		};
		
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
		
			// pagination works here for All Attack Lists  net-policy
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/db/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
	};
	
	
	/*
	*  Application function complete logic here 
	*/
	$scope.applicationAttempt = function(rec){
		$scope.view = "aea";
		ngProgress.start();
			$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};
			
			$scope.layers = {
			baselayers: {
				mapbox_light: {
					name: 'Mapbox Light',
					url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
					type: 'xyz',
					layerOptions: {
						apikey: 'pk.eyJ1Ijoic2FtaTE2MTYiLCJhIjoiY2loeWY3eGxoMDNzYnQzbTF0bXBidWl2ZSJ9.zPBRQZ_zPlcW5lAnEamzZA',
						mapid: 'mapbox.light'
					}
				},
				osm: {
					name: 'OpenStreetMap',
					url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					type: 'xyz'
				}
			}
		};
		
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					$scope.web = data;
					getwebSummary(data);
			}, function(error){
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					$scope.sip = data;
					getSipSummary(data);
			}, function(error){
				console.log(error);
			});
			
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/summary?size=10",function(data, status){
				console.log(data);
				//$scope.web = data;
				getwebSummary(data);
				ngProgress.complete();
			}, function(error){
			console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10",function(data, status){
			//	console.log(data);
				getSipSummary(data);
				$scope.sip = data;
			}, function(error){
			console.log(error);
			});
			
		}
		
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/application/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
				//	console.log($scope.markers);
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
					};					
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/ip-geopoints?size=100",function(data, status){
			//	console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
					console.log($scope.markers);
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};	
			}, function(error){
			console.log(error);
			});
		}
		
		
		function getwebSummary(sumary){
			//	console.log(sumary);
			//DB object
				$scope.webSummary = [];
				$scope.webSummaryLabel = [];
				sumary.forEach(function(elem,i) {
				$scope.webSummary.push([
					elem['category'],
					parseInt(elem['hits'])
				]);
			 $scope.webSummaryLabel.push(elem['category']);
			});
			
			$scope.chartSeries = [{
				name: "Web Summary",
				colorByPoint: true,
				data: $scope.webSummary
			}];
		
			$scope.webConfig = utilityMethods.chartLine($scope.chartSeries, 'Web Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.webSummaryLabel);
		
		};
		
		
		function getSipSummary(sumary){
			//	console.log(sumary);
			//DB object
				$scope.sipSummary = [];
				$scope.sipSummaryLabel = [];
				sumary.forEach(function(elem,i) {
				$scope.sipSummary.push([
					elem['category'],
					parseInt(elem['hits'])
				]);
				
			$scope.sipSummaryLabel.push(elem['category']);
			});
			
		$scope.chartSeries = [{
			name: "SIP Summary",
			colorByPoint: true,
			data: $scope.sipSummary
		}];
		
			$scope.sipConfig = utilityMethods.chartLine($scope.chartSeries, 'SIP Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.sipSummaryLabel);
		
		};
	
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
		//	console.log(event);
		//	console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
		
			// pagination works here for All Attack Lists  net-policy
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/application/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
			};		
		
	};
	
	/*
	*  Virus complete logic here 
	*/
	$scope.showvirusMap = function(rec){
		$scope.view = "virusMap";
		$scope.showPie = true;
		$scope.showMap = false;
		
		$scope.showMaps = function(){
			$scope.showPie = false;
			$scope.showMap = true;
		};
		
		$scope.showGraphs = function(){
			$scope.showPie = true;
			$scope.showMap = false;
		};
			
		$scope.pieChartArray = [];
		ngProgress.start();
			$scope.center ={
				lat: 42.5061,
				lng: 13.85,
				zoom: 6
			};	
			
			$scope.layers = {
			baselayers: {
				mapbox_light: {
					name: 'Mapbox Light',
					url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
					type: 'xyz',
					layerOptions: {
						apikey: 'pk.eyJ1Ijoic2FtaTE2MTYiLCJhIjoiY2loeWY3eGxoMDNzYnQzbTF0bXBidWl2ZSJ9.zPBRQZ_zPlcW5lAnEamzZA',
						mapid: 'mapbox.light'
					}
				},
				osm: {
					name: 'OpenStreetMap',
					url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					type: 'xyz'
				}
			}
		};
			
			$scope.data_file ;
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/summary?size=5&from="+gd1+"&to="+gd2,function(data, status){
			//	console.log(data);
				getData(data);
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/summary?size=5",function(data, status){
			//	console.log(data);
				$scope.vals = data;
			//	console.log($scope.data_file);
				ngProgress.complete();
				var d = {};
				d.node = [];
				d.links = [];
				data.forEach(function(elem){
					d.node.push({
						name:elem.malware,
						group:elem.hits
					});
				});
				console.log(d);
				getData(data);
			}, function(error){
			console.log(error);
			});
			}
		
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
				//	console.log(data);
					ngProgress.complete();
					data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
				}	
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/ip-geopoints?size=100",function(data, status){
				console.log(data);
				data.forEach(function(elem,i){
							 // console.log(elem['fields']['origin.geoPoint.lat'],elem['fields']['origin.geoPoint.lon'], elem['fields']['srcIP']);
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					//	console.log($scope.markers);
						if($scope.markers.length > 1){
						var lat = parseFloat($scope.markers[1]['lat']);
						var lon = parseFloat($scope.markers[1]['lng']);
						$scope.center = {
									lat: lat,
									lng: lon,
									zoom: 4
								};
						}								
			}, function(error){
			console.log(error);
			});
			}	
		
			
		  function getData (virus){
			$scope.obj = [];
			$scope.malwareLabel = [];
			$scope.ob = [];
			virus.forEach(function(elem, i) {
			$scope.obj.push([
				elem['malware'],
				parseInt(elem['hits'])
			]);
			$scope.malwareLabel.push(elem['malware']);
			
			});
			$scope.chartSeries = [{
			name: "Malwares",
			colorByPoint: true,
			data: $scope.obj
		}];

		$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'Most Malwares ', '<span style="font-size:10px">{series.name}: {point.y}</span>', false, $scope.malwareLabel);
			$scope.chartConfig['options']['plotOptions']['area']['events'] = {
				click: function(event) {
					console.log(event);
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.y
				};
					console.log(malwareName);
					console.log(malwareName.malware);
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/hashes/"+malwareName.malware+"/?size=10",function(data, status){
						console.log(data);
						$scope.hashes = data;
						var m = "placement";
						 $location.hash(m);
						 $anchorScroll();
					});
				}	
			};
		
		  };
		  
		 // pagination works here for All Malwares  net-policy
			$scope.pagination = {
					current: 1
			};
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				 ngProgress.start();
				 getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
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

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
		 
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
		//	console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});

	};
	

});