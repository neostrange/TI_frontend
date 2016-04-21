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
	
	$scope.date ={};
	$scope.d_one_error = { today: false, date_two :false };
	$scope.d_two_error = { today: false , date_one : false};
		$scope.onD1Set = function (newDate,oldDate) {
					
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
							  $scope.country['attackTypes'].push({exploit:elem.category, hits:elem.hits});	
							}
						});
		};
	 
		// 	console.log($scope.country['attackTypes']);
			 $scope.searchDate = function(){
					var d = new Date($scope.date.startDate);
					var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
					var d1 = utilityMethods.addTInDateTime(a);
				
					var dd = new Date($scope.date.endDate);
					var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
					var d2 = utilityMethods.addTInDateTime(a2);
				
					gd1 = d1;
					gd2 = d2;
					crudSrv.getResults(rootURL.url.baseURL +"global/country/"+$scope.stateCode+"/attack-counts?size=10&from="+d1+"&to="+d2,function(data, status){
						$scope.countries,$scope.obj = undefined;
					
						getAttackTypes(data);	
					}, function(error){
						console.log(error);
					});
					
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/all/ip-geopoints?size=100&from="+d1+"&to="+d2,function(data, status){
				
						$scope.mar = [];
						$scope.markers = [];
						data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						//	$scope.markers = $scope.mar;
			
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
				
				data.forEach(function(elem,i){
							 
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
				
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
			//$scope.relUrl = rootURL.url.baseURL +"attacks/all/ip-hits?cc="+$scope.stateCode;
				getResultsPage(1);
			
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				  ngProgress.start();
				  if( pageNum >= 1){
					  var diff = $scope.totalCount -(pageNum * 20);
					
					  if(diff <= 19){
						  limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/all/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				$scope.data = [];
				$scope.data = data.list;
			  	$scope.safeApply();
				
				}, function(error){
				console.log(error);
				});
		
			};		
			
	   
	
	var ip = "58.65.179.176";
	$scope.view = "country";
	$scope.countryName = $stateParams.cName;
	//alert($scope.countryName);
		
	$scope.$on("leafletDirectiveMarker.click", function(event, args) {
		
		var title = args['model']['label']['message'];
		$state.go("app.showIp", {
			ID: $scope.countryName,
			IP: title
		});
	});
	
	
	/*
	* Search Type of attack 
	*/
	function searchAttackType(nameKey, myArray){
		console.log(nameKey, myArray);
		for (var i=0; i < myArray.length; i++) {
        if (myArray[i].exploit == nameKey) {
				return myArray[i]['hits'];
			}
		}
	};
	
	$scope.changeView = function (view, hit){
		   console.log(view, $scope.country);
		  
			
			if(hit >= 1){
				 $scope.allAttacks = searchAttackType(view,$scope.country.attackTypes);
				 console.log($scope.allAttacks);
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
		$scope.markers = [];
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

					ngProgress.complete();
					data.forEach(function(elem,i){
						
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						
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
				
				data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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
			
			 var title = args['model']['label']['message'];
		
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
					
					  if(diff <= 19){
						  limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-compromise/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;

				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
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
		$scope.markers = [];
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
					
					ngProgress.complete();
					data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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
				
				data.forEach(function(elem,i){

								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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
					 
					  if(diff <= 19){
					 limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-policy/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
				}, function(error){
				console.log(error);
				});
		
			};		
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			
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
		$scope.markers = [];
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
				
					ngProgress.complete();
					data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						

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
				
				data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						
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
					 
					  if(diff <= 19){
						  limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/net-dos/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;

				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
				}, function(error){
				
				});
		
			};		
		
		
	};	
		
		
	
	/*
	*  Reconn function complete logic here 
	*/
	$scope.rec = function(rec){
		$scope.view = "rec";
		$scope.markers = [];
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
					
					ngProgress.complete();
					data.forEach(function(elem,i){
							 
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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
			
				data.forEach(function(elem,i){

								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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

					  if(diff <= 19){
						 limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 
				 $scope.totalCount = data.total;

				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
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
		$scope.markers = [];
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
				
					$scope.ssh = data;
					getSshSummary(data);
				
			}, function(error){
				console.log(error);
			});
			
			// withDate Time usernames	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/username?size=100&from="+gd1+"&to="+gd2,function(data, status){
				
					getUsername(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time passwords	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/password?size=10&from="+gd1+"&to="+gd2,function(data, status){
				
					getPassword(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time inputs	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/input?size=10&from="+gd1+"&to="+gd2,function(data, status){
				
					getInput(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time Combination
			crudSrv.getResults(rootURL.url.baseURL +"/attacks/ssh/credentials?size=10&from="+gd1+"&to="+gd2+"&cc="+$scope.stateCode,function(data, status){
				
					getCombination(data);
			}, function(error){
				console.log(error);
			});
			
			}else{
				// without dateTime ssh summary 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/summary?size=10",function(data, status){
			
				getSshSummary(data);
				$scope.ssh = data;	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh username 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/usernames?size=10",function(data, status){
			
				getUsername(data);	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh password 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/passwords?size=10",function(data, status){
			
				getPassword(data);	
				}, function(error){
				console.log(error);
				});
				
				
				// without dateTime ssh input 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/inputs?size=10",function(data, status){
			
					getInput(data);	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh Combination 
				crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/credentials?size=10&cc="+$scope.stateCode,function(data, status){
			
					getCombination(data);	
				}, function(error){
				console.log(error);
				});
			
			}
			
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){

					$scope.markers = undefined;
					$scope.markers = [];
					data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
				
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
		
				data.forEach(function(elem,i){

						var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
						message: elem['ip'] }};
						$scope.markers.push(obj);
				});
						
			
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
			
			passwords.forEach(function(elem,i) {
			$scope.passwords.push([
				elem['password'],
				parseInt(elem['hits'])
			]);
			$scope.passwordLabel.push(elem['password']);
			});
		
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
	
		$scope.chartSeries = [{
			name: "Username & Passwords",
			colorByPoint: true,
			data: $scope.combination
		}];
		$scope.combinationConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Username & Passwords', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false);
		};
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
		
		
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

					  if(diff <= 19){
						   limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;

				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
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
			
					$scope.db = data;
					getDBSummary(data);
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/summary?size=10",function(data, status){
				
				//$scope.db = data;
				getDBSummary(data);
				ngProgress.complete();	
			}, function(error){
			console.log(error);
			});
			}
		
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
					
					ngProgress.complete();
					data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
						
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
			
				data.forEach(function(elem,i){
							 
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						

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

					  if(diff <= 19){
						   limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/db/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();

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
		$scope.markers = undefined;
		$scope.markers = [];
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
				
					$scope.web = data;
					getwebSummary(data);
			}, function(error){
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
				
					$scope.sip = data;
					getSipSummary(data);
			}, function(error){
				console.log(error);
			});
			
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/summary?size=10",function(data, status){
				
				//$scope.web = data;
				getwebSummary(data);
				ngProgress.complete();
			}, function(error){
			console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10",function(data, status){
			
				getSipSummary(data);
				$scope.sip = data;
			}, function(error){
			console.log(error);
			});
			
		}
		
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/application/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
				
					ngProgress.complete();
					data.forEach(function(elem,i){
						
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
			
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
			
				data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
					
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
					
					  if(diff <= 19){
						   limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/application/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();

				}, function(error){
				console.log(error);
				});
		
			};		
		
	};
	
	/*
	*  Virus complete logic here 
	*/
	$scope.showvirusMap = function(rec){
		$scope.markers = undefined;
		$scope.markers = [];
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
			
				getData(data);
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/summary?size=5",function(data, status){
			
				$scope.vals = data;
			
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
				
				getData(data);
			}, function(error){
			console.log(error);
			});
			}
		
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=100&from="+gd1+"&to="+gd2,function(data, status){
				
					ngProgress.complete();
					data.forEach(function(elem,i){
							
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
				
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
				
				data.forEach(function(elem,i){
							 
								var obj = {lat:parseFloat(elem['lat']), lng: parseFloat(elem['long']), label: {
								message: elem['ip'] }};
								$scope.markers.push(obj);
						});
						
					
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
					
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.y
				};
					
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/hashes/"+malwareName.malware+"/",function(data, status){
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
					 
					  if(diff <= 19){
						   limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = data.total;
				
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				
				}, function(error){
				console.log(error);
				});
			};		
		 
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});

	};
	

});