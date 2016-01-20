app.controller('DetailCountryIpsCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter) {
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
	
	
		crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attack-counts?size=10",function(data, status){
			ngProgress.complete();
			console.log(data);
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
						 count = count + parseInt(elem.hits);
						 console.log(elem.hits);
						console.log($scope.country['attackTypes']['attacks']);	
						$scope.country['attackTypes'].push({exploit:elem.category, hits:elem.hits});	
						});
						
						$scope.country['attacks'] = count;
						/*
						 function compare(a,b) {
								if (a.hits > b.hits)
								return -1;
								if (a.hits < b.hits)
								return 1;
								return 0;
							};
			$scope.country['attackTypes'].sort(compare);
*/			
	 };
	 
			 $scope.searchDate = function(){
					var d = new Date($scope.date.startDate);
					var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
					var d1 = utilityMethods.addTInDateTime(a);
					console.log(d1, $scope.date.startDate);
					var dd = new Date($scope.date.endDate);
					var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
					var d2 = utilityMethods.addTInDateTime(a2);
					console.log(d2);
					gd1 = d1;
					gd2 = d2;
					crudSrv.getResults(rootURL.url.baseURL +"global/country/"+$scope.stateCode+"/attack-counts?size=10&from="+d1+"&to="+d2,function(data, status){
						$scope.countries,$scope.obj = undefined;
						getAttackTypes(data);	
					}, function(error){
						console.log(error);
					});
					
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/all/ip-geopoints?size=20&from="+d1+"&to="+d2,function(data, status){
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
		
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/all/ip-geopoints?size=20",function(data, status){
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
	
	$scope.changeView = function (view){
			//alert(view);
			if(view == 'Reconnaissance')
				//$scope.rec(view);
			if(view == 'SSH Attacks')
				alert("in");
				$scope.sshAttacks(view);
		    if(view == 'Database Attacks')
				$scope.dbAttacks(view);
			if(view == 'Application Exploit Attempts')
				$scope.applicationAttempt(view);
			if(view == 'Malware Infection')
				$scope.showvirusMap(view);
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
		
		$scope.markers = {};
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/probing/ip-geopoints?size=10&from="+gd1+"&to="+gd2,function(data, status){
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
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/probing/ip-geopoints?size=10",function(data, status){
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
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
	};
	
	/*
	*  SSH function complete logic here 
	*/
	$scope.sshAttacks = function(rec){
		$scope.view = "ssh";
		console.log(gd1, gd2);
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
					console.log(data);
					$scope.ssh = data;
			}, function(error){
				console.log(error);
			});
			
			// withDate Time usernames	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/username?size=10&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					getUsername(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time passwords	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/password?size=10&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					getPassword(data);
			}, function(error){
				console.log(error);
			});
			
			// withDate Time inputs	
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/input?size=10&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					getInput(data);
			}, function(error){
				console.log(error);
			});
			
			}else{
				// without dateTime ssh summary 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/summary?size=10",function(data, status){
				console.log(data);
				$scope.ssh = data;	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh username 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/usernames?size=10",function(data, status){
				console.log(data);
				getUsername(data);	
				}, function(error){
				console.log(error);
				});
				
				// without dateTime ssh password 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/passwords?size=10",function(data, status){
				console.log(data);
				getPassword(data);	
				}, function(error){
				console.log(error);
				});
				
				
				// without dateTime ssh input 
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/inputs?size=10",function(data, status){
				console.log(data);
					getInput(data);	
				}, function(error){
				console.log(error);
				});
			
			}
			
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/ip-geopoints?size=10&from="+gd1+"&to="+gd2,function(data, status){
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
					ngProgress.complete();
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/ssh/ip-geopoints?size=10",function(data, status){
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
		console.log($scope.passwords);
		$scope.chartSeries = [{
			name: "Attacks",
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
			name: "Attacks",
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
			name: "Attacks",
			colorByPoint: true,
			data: $scope.inputs
		}];
		$scope.inputConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Input Attack','<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false , $scope.inputLabel);
	
		};
        		
		
		crudSrv.getResults("json/ssh_attacks.json", function(data, status){
			ngProgress.complete();
			console.log(data);
			$scope.userPassword = data['username_password'];
		//Combination of passwords and Usernames
		$scope.combination = [];
		$scope.ob = [];
		$scope.userPassword.forEach(function(elem, i) {
			$scope.combination.push([
				elem['username']+ ":"+elem['passwords'],
				parseInt(elem['hits'])
			]);
		});
		console.log($scope.combination);
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.combination
		}];
		$scope.combinationConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Username & Passwords', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false);
		}, function(data,status){
			ngProgress.complete();
			utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
		});
		
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		 
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
	
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
					console.log(data);
					$scope.db = data;
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/summary?size=10",function(data, status){
				console.log(data);
				$scope.db = data;
				ngProgress.complete();	
			}, function(error){
			console.log(error);
			});
			}
		
			if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=10&from="+gd1+"&to="+gd2,function(data, status){
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
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=10",function(data, status){
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
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
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
					console.log(data);
					$scope.web = data;
			}, function(error){
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					$scope.sip = data;
			}, function(error){
				console.log(error);
			});
			
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/summary?size=10",function(data, status){
				console.log(data);
				$scope.web = data;
				ngProgress.complete();
			}, function(error){
			console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/sip/summary?size=10",function(data, status){
				console.log(data);
				$scope.sip = data;
			}, function(error){
			console.log(error);
			});
			
		}
		
		if(gd1 != undefined && gd2 != undefined){
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/application/ip-geopoints?size=10&from="+gd1+"&to="+gd2,function(data, status){
					console.log(data);
					ngProgress.complete();
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
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/web/ip-geopoints?size=10",function(data, status){
				console.log(data);
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
		
	
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});
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
				console.log(data);
				getData(data);
			}, function(error){
				console.log(error);
			});
			}else{
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/summary?size=5",function(data, status){
				console.log(data);
				$scope.vals = data;
				console.log($scope.data_file);
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
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/db/ip-geopoints?size=10&from="+gd1+"&to="+gd2,function(data, status){
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
				crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/ip-geopoints?size=10",function(data, status){
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
		
			
				
		
		  function getData (virus){
			$scope.obj = [];
			$scope.ob = [];
			virus.forEach(function(elem, i) {
			$scope.obj.push([
				elem['malware'],
				parseInt(elem['hits'])
			]);
			});
			$scope.chartSeries = [{
			name: "Malwares",
			colorByPoint: true,
			data: $scope.obj
		}];

		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Most Malwares ', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
			$scope.chartConfig['options']['plotOptions']['column']['events'] = {
				click: function(event) {
					console.log(event);
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.y
				};
					console.log(malwareName);
					console.log(malwareName.malware);
					crudSrv.getResults(rootURL.url.baseURL + "global/country/"+$scope.stateCode+"/attacks/malware/hashes/"+malwareName.malware+"/?size=10",function(data, status){
						$scope.hashes = data;
					});
				
				}	
		};
		
		  };
		
		$scope.$on("leafletDirectiveMarker.click", function(event, args){
			console.log(event);
			console.log(args);
			 var title = args['model']['label']['message'];
		//	$location.path("/CountryIps/" + $state.country + "/ip/" + title);
		
			$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		});

	};
	

});