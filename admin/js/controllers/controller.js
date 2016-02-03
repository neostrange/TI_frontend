app.controller('MainCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $timeout, $websocket, $interval, $state) {
	$scope.message = 'This is our Home Page';
	$scope.showModals = false;
	var stompClient;
	var format, typeobj;
	var i, cint, starts;
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
	$scope.showModal = function(item){
			$scope.modalType = item.data.type.toUpperCase();
			console.log($scope.modalType);
			$scope.showModals = true;
			$scope.detail = item.data.obj;
			console.log($scope.detail);
		};
		$scope.showModalHide = function(){
			$scope.showModals = false;
			$scope.detail = undefined;
			$scope.modalType = undefined;
		};
	
	crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries?size=10", function(data, status) {
		ngProgress.complete();
		console.log(data);
		getCountries(data);
	}, function(error) {
		console.log(error);
	});
	
	function getCountries(data) {
		$scope.obj = [];
		$scope.categories = [];
		data.forEach(function(elem, i) {
			console.log(elem);
			$scope.obj.push([
				elem['country'],
				parseInt(elem['hits'])
			]);

			$scope.categories.push(elem['country']);
		});

		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.obj
		}];
		$scope.chartConfig = utilityMethods.chartDot($scope.chartSeries, 'Top Attacking Countries ', '<br/><span style="font-size:10px"> Attacks : {point.y}</span>', false, $scope.categories, "Attacks");
	};
   
	crudSrv.getResults(rootURL.url.baseURL + "attacks/all/ips?size=10", function(data, status) {
		console.log(data);
		getIPs(data);
	}, function(error) {
		console.log(error)
	});

	function getIPs(data) {
		$scope.ob = [];
		$scope.combs = [];
		data.forEach(function(elem, i) {
			$scope.ob.push({
				name: elem['ip'],
				y: parseInt(elem['hits'])
			});

			$scope.combs.push(elem['ip']);
		});
		
		console.log($scope.ob);
		$scope.chartSeries = [{
			name: "IP Addresses",
			colorByPoint: true,
			data: $scope.ob
		}];

		$scope.difference = utilityMethods.chartObjs($scope.chartSeries, 'Top Attacking  IP Addresses', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> Attacks: {point.y}</span>', false, $scope.combs, "Attacks");
		$scope.difference['options']['plotOptions']['column']['events'] = {
			click: function(event) {
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.x
				};
				$state.go("app.showIp", {
					ID: "country",
					IP: event.point.name
				});
			}
		};
	};
	
	
	$scope.ops ={};
	var increment = 0;
	$scope.total = 0;
	$scope.db = 0;
	$scope.prob = 0;
	$scope.mal = 0;
	$scope.wb = 0;
	$scope.ssh = 0;
	$scope.sp = 0;
	$scope.items = [];

	function compares(a, b) {
		if (a.hits < b.hits) {
			return 1;
		}
		if (a.hits > b.hits) {
			return -1;
		}
		return 0;
	};
	//	
	var increment = 0;
	var malware = [],
		sip = [],
		probing = [],
		ssh = [],
		web = [], database = [];
		
	var data = [];
	var allAttack = [];
	var x = 0;
	$scope.items = [];
	$scope.limitTo = 50;
	$scope.malPerct = 0;
	$scope.sipPerct = 0;
	$scope.webPerct = 0;
	$scope.probPerct = 0;
	$scope.sshPerct = 0;
	$scope.dbPerct = 0;
	$scope.lineChartData = [];

	$scope.lineChartOptions = {
		chart: {
			type: 'lineChart',
			height: 330,
			margin: {
				top: 40,
				right: 15,
				bottom: 55,
				left: 30
			},
			x: function(d) {
				return d.x;
			},
			y: function(d) {
				return d.y;
			},
			useInteractiveGuideline: true,
			dispatch: {
				stateChange: function(e) {
					console.log("stateChange");
				},
				changeState: function(e) {
					console.log("changeState");
				},
				tooltipShow: function(e) {
					console.log("tooltipShow");
				},
				tooltipHide: function(e) {
					console.log("tooltipHide");
				}
			},
			xAxis: {
				axisLabel: 'Time(M)',
				tickFormat: function(d) {
					return d3.time.format('%X')(new Date(d))
				}
			},
			yAxis: {
				axisLabel: 'Attacks (no)',
				tickFormat: function(d) {
					return d3.format('d')(d);
				},
				axisLabelDistance: 30
			},
			callback: function(chart) {
				console.log("!!! lineChart callback !!!");
			}
		},
		title: {
			enable: true,
			text: 'Types of Attacks',
			"css":{
				"text-align": "center",
				"color":"black"
			}
		}
	};

	function getType (service , ob){
			var type ;
			if(service == "ssh"){
				type = "ssh";
			}else if(service == "smb" || service == "microsoft-ds" ){
				    if(ob.hasOwnProperty('md5Hash')){
							type  = "malware";
					}else{
						type = "probing";
					} 
			}else if(service == "sip" ){
				type = "sip";
			}else if(service == "http" || service == "https" || service == "http-alt" || service == "smc-https" ){
				type = "web";
			}else if(service == "mssql" || service == "ms-sql-s" || service == "mysql" || service == "postgresql" || service == "sqlserv" || service == "neo4j"){
				 type = "database";
			}else{
				type = "probing";
			}
	
		return type;
	};
	
	typeobj = {sip:0, malware:0, web:0, probing:0, ssh:0, database:0};
	console.log(typeobj);
	var check = function(type) {
	//	$scope.total = $scope.total + 1;
		if (type == "malware") {
			$scope.mal = $scope.mal + 1;
			typeobj.malware++;
		} else if (type == "sip") {
			$scope.sp = $scope.sp + 1;
			typeobj.sip++;
		} else if (type == "web") {
			$scope.wb = $scope.wb + 1;
			typeobj.web++;
		}else if(type == "database"){
				$scope.db = $scope.db +1;
				typeobj.database++;
		} else if (type == "ssh") {
			$scope.ssh = $scope.ssh + 1;
			typeobj.ssh++;
		} else if (type == "probing") {
			$scope.prob = $scope.prob + 1;
			typeobj.probing++;
		} else {

		}
		console.log(typeobj);
	};

	function start(){
		starts = $interval(function() {
		console.log("start here ...............");
		var d = new Date();
		var e = d.getTime();
		var m = typeobj;
		console.log(typeobj);
		getCountTime(m, e);
		typeobj = {sip:0, malware:0, web:0, probing:0, ssh:0, database:0};
		console.log(typeobj);
		}, 60000);
	};
	
	start();
	
	var socket = new SockJS("http://115.186.132.18:8080/TI/rt/");
	stompClient = Stomp.over(socket);
	stompClient.connect({}, function(frame) {
		stompClient.subscribe('/live/incidents', function(greeting) {
			var mm = JSON.parse(greeting.body);
			var obj =[];
			if(mm.length > 0){
				mm.forEach(function(m){
					var ob = {
					"Ip": m.srcIP,
					"country-code": m['origin']['srcCountryCode'],
					"name": m['origin']['srcCountry'],
					"lat": m.origin.geoPoint.lat,
					"longs": m.origin.geoPoint.lon,
					"type": getType(m.service, m),
					"port": m.dstPort,
					"affected": {
						"lat": 33.36,
						"longs": 73.66
					},
					"obj":m
					};
					obj.push(ob);
			});	
				getRealTime(obj);
			
			}
		});
		
		/*
		stompClient.subscribe('/live/counts', function(greeting) {
			console.log(JSON.parse(greeting.body));
			console.log(greeting.body);
			var m = JSON.parse(greeting.body);
			var d = new Date();
			var e = d.getTime();
			getCountTime(m, e);
		});
		*/
	
	});

	$scope.$on("$destroy", function(event) {
		//	$scope.apis.refresh();
		if (stompClient != null) {
                stompClient.disconnect();
            }
		$interval.cancel(starts);
		$scope.apis.clearElement();
	});
	
	function getCountTime(val, date) {
		console.log(typeof val.database);
		if( val.malware + val.sip + val.web + val.probing + val.ssh + val.database == 0 ){
		}
		else{
		malware.push({
			x: date,
			y: val.malware
		});
		sip.push({
			x: date,
			y: val.sip
		});
		web.push({
			x: date,
			y: val.web
		});
		
		probing.push({
			x: date,
			y: val.probing
		});
		
		ssh.push({
			x: date,
			y: val.ssh
		});
		
		database.push({
			x: date,
			y: val.database
		});
		
		allAttack.push({
			x: date,
			y:val.malware + val.sip + val.web + val.probing + val.ssh + val.database
		});
		if( all != 0){
			var all = val.malware + val.sip + val.web + val.probing + val.ssh;
			$scope.malPerct = Math.floor((val.malware / all) * 100);
			$scope.sipPerct = Math.floor((val.sip / all) * 100);
			$scope.webPerct = Math.floor((val.web / all) * 100);
			$scope.probPerct = Math.floor((val.probing / all) * 100);
			$scope.sshPerct = Math.floor((val.ssh / all) * 100);
			$scope.dbPerct = Math.floor((val.database / all) * 100);
		}
		var obj = [{
			values: malware, //values - represents the array of {x,y} data points
			key: 'Malware Attacks', //key  - the name of the series.
			color: '#f05050' //color - optional: choose your own line color.
		}, {
			values: sip,
			key: 'Sip Attacks',
			color: '#2ca02c'
		}, {
			values: web,
			key: 'Web Attacks',
			color: '#23b7e5'

		}, {
			values: probing,
			key: 'Probing Attacks',
			color: '#FFA07A'

		}, {
			values: ssh,
			key: 'Ssh Attacks',
			color: '#141719'

		},
		 {
			values: database,
			key: 'Database Attacks',
			color: '#54596a'

		},{
			values: allAttack,
			key: 'Total Attacks',
			color: '#999'
		}];
		
		$scope.lineChartData = obj;
		$scope.safeApply();
		$scope.apis.update();
		}
	};

	
	function getRealTime(data) {
	$scope.arrItem  = [];	
		console.log($scope.items.length);
	//	check($scope.value.type);

		if ($scope.items.length >= 1) {
				data.forEach(function(elem){
					$scope.items.push({
					data: elem,
					hits: increment
				});
				increment++;
				check(elem.type);
			});
			
			$scope.items.sort(compares);
			$scope.value = data;
			$scope.safeApply();
			//console.log($scope.items);
			//array1 = array1.concat(array1.splice(0,3));
		} else {
			data.forEach(function(elem){
				$scope.items.push({
				data: elem,
				hits: increment
				});
					increment++;
				    check(elem.type);
				});
				
				if($scope.items.length >= 2){
					$scope.items.sort(compares);
					$scope.value = data;
					$scope.safeApply();
				}else{
					$scope.value = data;
					$scope.safeApply();
				}
		}
	};

	
});
app.controller('AppSearchCtrl', function($scope, $rootScope, $location, utilityMethods, $state, $cookies) {
	
	  $scope.header ={};
	  $scope.chooseValue = function(criteria){
		
		var ip = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/
		
		var te = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
		var p = ip.test(criteria);
			if(p == true){
				 	$state.go("app.showIp", {ID: "ct", IP: criteria});  
			}else{
				//$state.go("app.", {ID: "ct", IP: criteria});  
			}		
		};
	   
	   
	   $scope.clearSearch = function()
	   {
		   $scope.selected = undefined;
	   };
	   
	  
	  $scope.logout = function(){
		delete $cookies['token'];
		  $state.go('app.dashboard-v1');
	};
	  
});

app.controller('executiveSummaryCtrl', function($scope, $rootScope) {
	$scope.message = 'Executive Summary';
});

app.controller('globalDataAnalysisCtrl', function($scope, $rootScope) {
	$scope.message = 'Global Data Analysis';
});

/*
 * ========================================================================================================================
 * ===================================== Global Data Analysis Section For CONTROLLLERS ====================================
 * ========================================================================================================================
 */

/*
 * ========================================================================================================================
 * ===================================== Malware Attacks Section For CONTROLLLERS =========================================
 * ========================================================================================================================
 */
app.controller('ProbingCountriesUniqueIPCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL ,$filter, $state) {
	$scope.message = 'Most Probing Countries - Unique IP\'s';
	ngProgress.start();
	$scope.heading = "Malware";
	$scope.date = {};
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
	
			function compares(a, b) {
				if (a.uniqueIPCount < b.uniqueIPCount) {
					return 1;
				}
				if (a.uniqueIPCount > b.uniqueIPCount) {
					return -1;
				}
				return 0;
			};
			crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/unique-ips-per-country?size=10",function(data, status){
				console.log(data);
				
				ngProgress.complete();
					data.sort(compares);
				getData(data);
			}, function(error){
			console.log(error);
			});
				
				
			function getData (data){
				$scope.pieChartArray = [];
				data.forEach(function(elem, i) {
					$scope.pieChartArray.push({
						name: elem['country'],
						y: parseInt(elem['uniqueIPCount'])
						});
				});
							
			//$scope.pieChartArray.sort(compares);
			$scope.chartSeries = [{
			name: "Unique IP's",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Probing Countries - Unique IP\'s', '<span style="font-size:10px">{series.name}: {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');				
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/probing/unique-ips-per-country?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
		});
		
		};
});

app.controller('ProbingIPCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL ,$filter, $state) {
		$scope.message = 'Most Probing IP\'s';
		$scope.heading = "Malware";
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
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/ips?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
			
				getData(data);
			}, function(error){
			console.log(error);
		});
					
			function getData(data){
			$scope.pieChartArray = [];
			$scope.data = [];
			$scope.data = data;
			data.forEach(function(elem, i){
			$scope.pieChartArray.push({	
				name: elem['ip'],
				x: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			});
		
			$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.pieChartArray
			}];
		
			$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Probing IP\'s', '<span style="font-size:10px">{series.name}: {point.y} </span><br /><span style="font-size:10px">Country: {point.x}</span>');
			$scope.chartConfig['options']['plotOptions']['pie']['events'] = {
			click: function (event) {
			  $state.go("app.showIp", {ID: "country", IP: event.point.name});
			}
			};				
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/probing/ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});		
		};
	
});

app.controller('AttackingIPCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter, $state) {
	$scope.message = 'Most Attacking IP\'s';
	ngProgress.start();
	$scope.heading = "Malware";
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
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ips?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
			});
			
			
					
			function getData(data){
			$scope.pieChartArray = [];
			$scope.data = [];
			$scope.data = data;
			data.forEach(function(elem, i){
			$scope.pieChartArray.push({	
				name: elem['ip'],
				x: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			});
		
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Attacking IP\'s', '<span style="font-size:10px">{series.name}: {point.y} </span><br /><span style="font-size:10px">Country: {point.x}</span>');
		$scope.chartConfig['options']['plotOptions']['pie']['events'] = {
			click: function (event) {		
			  $state.go("app.showIp", {ID: "country", IP: event.point.name});
			}
			};					
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});			
		};
	
	
});

app.controller('AttackingIPFixCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL , $filter) {
	$scope.message = 'Attacking IP\'s - 10 Attacks';
	$scope.heading = "Malware";
	ngProgress.start();
	$scope.date = {};
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
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ips?minCount=10&size=100",function(data, status){
				console.log(data);
				ngProgress.complete();
				$scope.data = data;
			}, function(error){
			console.log(error);
		});

		$scope.searchDate = function(){
			var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
				console.log(d2);
				crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ips?minCount=10&size=10&from="+d1+"&to="+d2,function(data, status){
				console.log(data);
				ngProgress.complete();
				$scope.data = data;
			}, function(error){
			console.log(error);
		});	
		
	};
	
});

app.controller('TopVulnerabilitiesCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress) {
	$scope.message = 'Top Vulnerabilities';
	ngProgress.start();
	crudSrv.getResults("json/top_vulnerability.json", function(data, status){
		ngProgress.complete();
		$scope.data = data['results'];
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
});

app.controller('AttackedProtocolCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL , $filter) {
	$scope.message = 'Attacked Protocols';
	$scope.heading = "Malware";
	$scope.pieChartArray = [];
	$scope.date={};
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
		ngProgress.start();
		crudSrv.getResults(rootURL.url.baseURL +"attacks/targeted-services?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['service'],
							y: parseInt(elem['hits'])
						});
			
			$scope.categories.push(elem['service']);
			});
		
		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
	
			$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Attacked Protocols', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');				
		};
	
			$scope.searchDate = function(){
			var d = new Date($scope.date.startDate);
			var d1 = d.toISOString();
			console.log(d1);
			var dd = new Date($scope.date.endDate);
			var d2 = dd.toISOString();
			console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/targeted-services?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});	
			
		};
	
	
});
				
app.controller('ProbingCountriesCtrl', function($scope, $rootScope, $http, $timeout, crudSrv, utilityMethods, ngProgress, rootURL,es, $filter) {
	$scope.message = 'Most Probing Countries';
	$scope.heading = "Malware";
	
	/*
	$scope.pieChartArray = [];
	$scope.date = {};
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
	ngProgress.start();
	var query = {
				 "query" : {
					  "filtered" : { 
						 "filter" : {
							"bool" : {
							  "should" : [
								 { "term" : {"signatureClass" : "attempted-recon"}}, 
								 { "term" : {"signatureClass" : "misc-activity"}} 
							  ]
						   }
						 }
					  }
				   },
                "aggs":{
                    "remote_country":{
                        "terms":{
                            "field":"origin.srcCountry"
                            
                        }                    
                    }
                }
		};
			$scope.obj = [];
			$scope.comb =[];
			es.search({index:"incident",
				type:"NetworkLayerIncident",
				search_type:"count",
				body:query
			}).then(function(resp){
				ngProgress.complete();
				console.log(resp.aggregations.remote_country.buckets);
				$scope.data = resp.aggregations.remote_country.buckets;
				$scope.data.forEach(function(elem, i) {
					if(elem['remote_country'].buckets.length == 0){
						 var key ={key:"unknown"};
						
						elem['remote_country'].buckets.push(key);
					}
				$scope.obj.push([
				elem['remote_country']['buckets'][0]['key'],
				parseInt(elem['doc_count'])
			]);
			
			$scope.comb.push(elem['key_as_string']); 

		});
		console.log($scope.obj);
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.obj
		}];
		
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top BruteForce Countries', '<span style="font-size:9px"></span> <br/><span style="font-size:9px">{series.name}: {point.y}</span>', true, $scope.comb);
				
			});
			
		$scope.searchDate = function(){
				
				 var d = new Date($scope.date.startDate);
				var d1 = d.toISOString();
				console.log(d1);
				var dd = new Date($scope.date.endDate);
				var d2 = dd.toISOString();
				console.log(d2);
				
		var querys ={
			"query":{
				"filtered":{
					"filter": { 
					"range":{
						"dateTime":{
							"gte":d1,
							"lte":d2
						}        
					  }
					}
				}
			},
			"aggs":{
				"SipTools":{
					"terms":{
						"field":"sipUserAgent"
				}
			}
			}};	
			
				utilityMethods.commonElasticQuery(querys, "NetworkLayerIncident", function(resp){
						ngProgress.complete();
						console.log(resp);
						var data = resp.aggregations.SipTools.buckets;
						console.log(data);
				
				data.forEach(function(elem, i) {
					if(elem['remote_country'].buckets.length == 0){
						 var key ={key:"unknown"};
						
						elem['remote_country'].buckets.push(key);
					}
					console.log(elem);
					$scope.obj.push([
					elem['key'],
					parseInt(elem['doc_count'])
				]);
				$scope.combination.push(elem['key']);
			});	
				$scope.chartSeries = [{
				name: "Attacks",
				colorByPoint: true,
				data: $scope.obj
				}];
				$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'SIP Tools', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>', false, $scope.combination);
			});
		};	
			
	
	
	crudSrv.getResults(rootURL.url.baseURL + "probingcountries/", function(data, status){
		ngProgress.complete();
		data.forEach(function(elem, i) {
			$scope.pieChartArray.push({
				name: elem['remote_country'],
				y: parseInt(elem['counts'])
			});
		});
		
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Probing Countries', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
		
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
		*/
});

app.controller('DetectedMalwareCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, es, $filter) {
	$scope.message = 'Top Few Malwares Detected';
	$scope.heading = "Malware";
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
	
		crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/names?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
	
	     function getData(data){
			$scope.pieChartArray = [];
			data.forEach(function(elem, i) {
			$scope.pieChartArray.push({
				name: elem['malware'],
				y: parseInt(elem['hits'])
			});
		});
		
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Malwares Detected', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
		$scope.chartConfig['options']['plotOptions']['pie']['events'] = {
			click: function (event) {
				var malwareName = {
					"malware" : event.point.name,
					"downloads": event.point.y
				};
				
				crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/hashes?size=10&mal="+malwareName.malware,function(data, status){
				console.log(data);
				ngProgress.complete();
				 $scope.hashes = data;
			}, function(error){
				console.log(error);
			});
				
			}
		};	
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
		crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/hashes?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
		});
	
	};
				
		
});

app.controller('AttackingCountriesCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Most Attacking Countries';
	$scope.heading = "Malware";
	$scope.pieChartArray = [];
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
	ngProgress.start();
		crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/countries?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
				$scope.pieChartArray.push({
				name: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			$scope.categories.push(elem['country']);
			});
		
			$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
			}];
	$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Attacking Countries', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
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
		crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/countries?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});	
			
		};
	
});

app.controller('DetectedMalwareHashCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL) {
	$scope.message = 'Detected Malware Hashes';
	$scope.heading = "Malware";
	ngProgress.start();
	$scope.date = {};
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
		crudSrv.getResults(rootURL.url.baseURL + "malwarehash/", function(data, status){
		ngProgress.complete();
		$scope.data = data;
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
	
	
});

app.controller('CNCIPCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL) {
	$scope.message = 'CnC IP Addresses & Domains';
	ngProgress.start();
	$scope.heading = "Malware";
	crudSrv.getResults(rootURL.url.DjangoURL + "cncip/", function(data, status){
		ngProgress.complete();
		$scope.ipAndCountry = data;
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
	
	crudSrv.getResults(rootURL.url.DjangoURL + "cncdomain/", function(data, status){
		ngProgress.complete();
		$scope.domains = data;
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
	
	
});

app.controller('ProbingCountriesCtrl', function($scope, $rootScope, $http, $timeout, crudSrv, utilityMethods, ngProgress, rootURL,$filter) {
	$scope.message = 'Most Probing Countries';
	$scope.heading = 'Malware';
	$scope.date = {};
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
			$scope.pieChartArray = [];
			ngProgress.start();
			crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/countries?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
				$scope.pieChartArray.push({
				name: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			$scope.categories.push(elem['country']);
			});
		
			$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
			}];
	
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Probing Countries', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
		};
		$scope.searchDate = function(){
			var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		crudSrv.getResults(rootURL.url.baseURL + "attacks/probing/countries?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});
		
		};
	
	

});

/*
 * ========================================================================================================================
 * ======================================== SIP Attacks Section For CONTROLLLERS ==========================================
 * ========================================================================================================================
 */

app.controller('SIPAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'SIP Attacks';
	$scope.heading = 'SIP Attacks';
	ngProgress.start();
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

		$scope.pieChartArray = [];
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/countries?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/methods?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				$scope.data = data;
			}, function(error){
			console.log(error);
		});
		
		
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
				$scope.pieChartArray.push({
				name: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			$scope.categories.push(elem['country']);
			});
		
			$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
			}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Top SIP Countries', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
			
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
				crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/countries?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});
			
			crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/methods?size=10&from="+d1+"&to="+d2,function(data, status){
				console.log(data);
				ngProgress.complete();
				$scope.data = data;
			}, function(error){
			console.log(error);
			});
		};
	
});

app.controller('SIPRegistrarAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter, $state) {
	$scope.message = 'SIP Registrar Server Attacks';
	$scope.heading = 'SIP Attacks';
	$scope.obj = [];
	$scope.comb = [];
	$scope.date = {};
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
	ngProgress.start();
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/registrar-flooding-ips?size=10",function(data, status){
			console.log(data);
			ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
			});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					$scope.pieChartArray.push({
						name: elem['countryCode'],
						y: parseInt(elem['hits'])
					});
				$scope.categories.push(elem['ip']);
			});
		
			$scope.chartSeries = [{
				name: "IP Addresses",
				colorByPoint: true,
				data: $scope.pieChartArray
			}];
			$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Registrar Server Attacks', '<span style="font-size:10px">{series.name}: {point.y} </span><br /><span style="font-size:10px">Country: {point.x}</span>', true, $scope.categories, "Attacks");	
			$scope.chartConfig['options']['plotOptions']['column']['events'] = {
				click: function (event) {		
								$state.go("app.showIp", {ID: "country", IP: event.point.category});
							
				}
			};
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
				crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/registrar-flooding-ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){
				
			});
		
		};	
	
	
});

app.controller('SIPOptionFloodingAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter , $state) {
	$scope.message = 'SIP Option Flooding Attacks';
	$scope.heading = 'SIP Attacks';
	ngProgress.start();
	$scope.date = {};
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
	
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/options-flooding-ips?size=10",function(data, status){
			console.log(data);
			ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
			});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					
					$scope.pieChartArray.push({
						name: elem['countryCode'],
						y: parseInt(elem['hits'])
					});
						
				$scope.categories.push(elem['ip']);
			});
		
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Option Flooding Attacks ', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">Attack :{point.y}</span>', true, $scope.categories, "Attacks");	
			$scope.chartConfig['options']['plotOptions']['column']['events'] = {
				click: function (event) {		
					$state.go("app.showIp", {ID: "country", IP: event.point.category});
							
				}
		};	
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/option-flooding-ips?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});
		
		};	
	
	

});

app.controller('SIPFloodingProxyAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter , $state) {
	$scope.message = 'SIP Flooding Proxy Server Attacks';
	ngProgress.start();
	$scope.heading = 'SIP Attacks';
	$scope.date  ={};
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
	
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/proxy-flooding-ips?size=10",function(data, status){
			console.log(data);
			ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
			});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					
					$scope.pieChartArray.push({
						name: elem['countryCode'],
						y: parseInt(elem['hits'])
					});
						
				$scope.categories.push(elem['ip']);
			});
		
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Flooding Proxy Server', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> Attacks : {point.y}</span>', true, $scope.categories, "Attacks");
		$scope.chartConfig['options']['plotOptions']['column']['events'] = {
				click: function (event) {		
					$state.go("app.showIp", {ID: "country", IP: event.point.category});
				
				}
		};	
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
		crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/proxy-flooding-ips?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});
		
		};	
});

app.controller('SIPToolsCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL,$filter) {
	$scope.message = 'SIP Tools';
	$scope.heading = 'SIP Attacks';
	ngProgress.start();
	$scope.obj = [];
	$scope.date = {};
	$scope.combination = [];
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
	
			crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/tools?size=10",function(data, status){
			console.log(data);
			ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
			});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					if(elem['tools'] == ""){
						elem['tools'] = "unknown";
					}
					$scope.pieChartArray.push({
						name: elem['tools'],
						y: parseInt(elem['hits'])
					});
						
				$scope.categories.push(elem['tools']);
			});
		
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
				$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'SIP Tools','<br/><span style="font-size:10px">{series.name}: {point.y}</span>', false, $scope.categories, "Attacks");
				
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
		crudSrv.getResults(rootURL.url.baseURL + "attacks/web/tools?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});
		};
			
			
});

/*
 * ========================================================================================================================
 * ======================================== WEB Attacks Section For CONTROLLLERS ==========================================
 * ========================================================================================================================
 */

app.controller('TopFewCountriesCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Top Few Countries With Most Web Attacks';
	ngProgress.start();
	$scope.heading = "Web-Attacks";
	$scope.date ={};
	$scope.combination = [];
	$scope.pieChartArray = [];
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
	
	
	crudSrv.getResults(rootURL.url.baseURL +"attacks/web/countries?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
	});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['country'],
							y: parseInt(elem['hits'])
						});
			
			$scope.categories.push(elem['country']);
			});
		
		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Few Countries With Most Web Attacks', '<span style="font-size:10px">{series.name}: {point.y}</span>', false, $scope.categories, "Attacks");
		
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/countries?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});	
		};
	
	
	
});

app.controller('TopFewIPsCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter, $state) {
	$scope.message = 'Top Few IP Addresses With Most Web Attacks';
	ngProgress.start();
	$scope.heading = "Web-Attacks";
	$scope.obj = [];
	$scope.date = {};
	$scope.comb = [];	
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
	
	crudSrv.getResults(rootURL.url.baseURL +"attacks/web/ips?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
			function getData(data){
			$scope.pieChartArray = [];
			$scope.data = [];
			$scope.data = data;
			data.forEach(function(elem, i){
			$scope.pieChartArray.push({	
				name: elem['ip'],
				x: elem['country'],
				y: parseInt(elem['hits'])
			});
			
			});
		
		$scope.chartSeries = [{
			name: "Attacks",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Top Few web IPs', '<span style="font-size:10px">{series.name}: {point.y} </span><br /><span style="font-size:10px">Country: {point.x}</span>');
			$scope.chartConfig['options']['plotOptions']['pie']['events'] = {
				click: function (event) {		
				$state.go("app.showIp", {ID: "country", IP: event.point.name});
				}
			};					
		};
		
		/*
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['ip'],
							x:elem['countryCode'],
							y: parseInt(elem['hits'])
						});
			
			$scope.categories.push(elem['ip']);
			});
		
		$scope.chartSeries = [{
			name: "IP Addresses",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
			
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Few web IPs', '<span style="font-size:9px"></span> <br/><span style="font-size:9px">Attacks :{point.y}</span>', true, $scope.categories, "Attacks");
		};
		*/
		$scope.searchDate = function(){
			 var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				console.log(data);
				getData(data);
			},function(error){
				
			});		
				
		};
	
	
	
});

app.controller('TopFewWebAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Top Few Web Attacks';
	$scope.heading = "Web-Attacks";
	var data = [];
	$scope.categories = [];
	$scope.date = {};
	
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
		$scope.pieChartArray = [];
		ngProgress.start();
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/web/categories?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					$scope.pieChartArray.push({
						name: elem['attack'],
						y: parseInt(elem['hits'])
					});
						
				$scope.categories.push(elem['attack']);
			});
		
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'Top Few Web Attacks', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories, "Tools Hits");
		
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/categories?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			console.log(data);
			 getData(data);
			},function(error){
				
			});
				
		};
	
	
});

/*
 * ========================================================================================================================
 * ======================================== Brute Force Attacks Section For CONTROLLLERS ==================================
 * ========================================================================================================================
 */

app.controller('BruteForceCTRL', function($scope, $rootScope, $http, $timeout, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.heading = "Brute-Force";
	$scope.pieChartArray = [];
	$scope.combination = [];
	$scope.date = {};
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
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/countries?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['country'],
							y: parseInt(elem['hits'])
						});
						
						$scope.categories.push(elem['country']);
					});
		
		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'Top Brute-Force Countries', '<span style="font-size:9px">{series.name}: {point.y}</span>', false, $scope.categories, "Attack");
		
		
		};
		
		
		$scope.searchDate = function(){
				var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/countries?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});
				
		};
	
});
 
app.controller('ConductingSSHAttacksCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter, $state) {
	$scope.message = 'Top Few IP Addresses Conducting SSH Attacks';
	$scope.heading = "Brute-Force";
	ngProgress.start();
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
	
			crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/ips?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['countryCode'],
							y: parseInt(elem['hits'])
						});
			
			$scope.categories.push(elem['ip']);
			});
		
		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
			
		$scope.chartConfig = utilityMethods.chartObjs($scope.chartSeries, 'IP Conducting SSH', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">Attacks:{point.y}</span>', true, $scope.categories, "Attacks");
		$scope.chartConfig['options']['plotOptions']['column']['events'] = {
				click: function (event) {		
								$state.go("app.showIp", {ID: "country", IP: event.point.category});
							
				}
		};
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/ips?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			console.log(data);
			 getData(data);
			},function(error){
				
			});
		
		};
	
});

app.controller('SSHToolsCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Mostly Used Tools For SSH Based Attacks';
	ngProgress.start();
	$scope.heading = "Brute-Force";
	$scope.date  = {};
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
		crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/tools?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['tools'],
							y: parseInt(elem['hits'])
						});
						
						$scope.categories.push(elem['tools']);
					});
		
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.allConfig = utilityMethods.chartLine($scope.chartSeries, 'Tools used for SSH Attacks', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories, "Attacks");
		
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/tools?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			},function(error){
				
			});
		};
	
	
	/*
	crudSrv.getResults(rootURL.url.baseURL + "sshtools/ ", function(data, status){
		ngProgress.complete();
		$scope.data = data;
		$scope.categories = [];
		$scope.combination = [];
		data.forEach(function(elem, i) {
			$scope.combination.push([
				elem['client'],
				parseInt(elem['hits'])
			]);
			$scope.categories.push(elem['client']);
		});
		
		console.log($scope.combination);
		$scope.chartSeries = [{
			name: "SSH Tools",
			colorByPoint: true,
			data: $scope.combination
		}];
		
			$scope.allConfig = utilityMethods.chartLine($scope.chartSeries, 'Tools Used For SSH', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories);
			
		
		
		console.log($scope.data);	
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
	*/
});

app.controller('MostUsedUsernameCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Most Commonly Used Passwords';
	ngProgress.start();
	$scope.heading = "Brute-Force";
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
	
		crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/usernames?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['username'],
							y: parseInt(elem['hits'])
						});
						
						$scope.categories.push(elem['username']);
					});
		
		$scope.chartSeries = [{
			name: "Usernames",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.allConfig = utilityMethods.chartLine($scope.chartSeries, 'Most Used Usernames', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories);
		
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/usernames?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			});
		};
	
	
	
	
});

app.controller('MostUsedPasswordCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Most Commonly Used Usernames';
	ngProgress.start();
	$scope.heading = "Brute-Force";
	$scope.date = {};
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
		
	
		crudSrv.getResults(rootURL.url.baseURL +"attacks/ssh/passwords?size=10",function(data, status){
				console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						$scope.pieChartArray.push({
							name: elem['password'],
							y: parseInt(elem['hits'])
						});
						
						$scope.categories.push(elem['password']);
					});
		
		$scope.chartSeries = [{
			name: "Passwords",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.allConfig = utilityMethods.chartLine($scope.chartSeries, 'Top Few Passwords', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories);
		
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
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/passwords?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			 getData(data);
			});
		};
	
	/*
	crudSrv.getResults(rootURL.url.baseURL + "passwords/ ", function(data, status){
		ngProgress.complete();
		$scope.data = data;
		$scope.combination = [];
		$scope.categories = [];
		data.forEach(function(elem, i) {
			$scope.combination.push([
				elem['passwords'],
				parseInt(elem['hits'])
			]);
			$scope.categories.push(elem['passwords']);
		});
		
		console.log($scope.combination);
		$scope.chartSeries = [{
			name: "Passwords",
			colorByPoint: true,
			data: $scope.combination
		}];
		
			$scope.allConfig = utilityMethods.chartLine($scope.chartSeries, 'Most Passwords  ', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',true, $scope.categories);
		console.log($scope.data);	
	}, function(data,status){
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});
	*/
});

/*
 * ========================================================================================================================
 * ======================================== Map Section For CONTROLLLERS ==================================
 * ========================================================================================================================
 */
 
 app.controller('GlobalThreatCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, $window, $state, $filter, rootURL) {
	
	$scope.countries = [];
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
	
	$scope.obj ={};
	
		crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries",function(data, status){
			ngProgress.complete();
			console.log(data.length);
			getData(data);
		}, function(error){
			console.log(error);
		});
	
			/*
			utilityMethods.commonElasticQuery(utilityMethods.globalCountQuery(), "", function(resp){
						ngProgress.complete();
						console.log(resp);
				console.log(resp.aggregations.Country.buckets);
				getData(resp.aggregations.Country.buckets);
			},function(error){console.log(error)});
			*/	
	  		function getData (data){
				$scope.map = {};
				$scope.mapPlugins = undefined;
				 var objs ={};
				$scope.countries = [];
				$scope.countries = [];
				 $scope.obj = undefined;  $scope.obj = {};
			console.log(data);
		
				var colors =[
				"#260033",
				"#600080",
				"#9900cc",
				"#bf00ff",
				"#cc33ff",
				"#d966ff",
				"#e699ff",
				"#ecb3ff",
				"#f2ccff",
				"#ffccff",
				"#f7e5ff"
				];
				for(var i in data)
		(function(i){
			 
			 if(data[i].key == "Europe"){
				console.log("eu"); 
			 }
			 else{
				 if( i <= 9){
					var obj ={
					 color:colors[i], numberOfThings: data[i].hits, country:data[i].country, countryCode:data[i].countryCode.toLowerCase()
					};
				 }else{
					 var obj ={
					 color:colors[10], numberOfThings: data[i].hits, country:data[i].country, countryCode:data[i].countryCode.toLowerCase()
					};
				 }
			 console.log(obj);
		//	 console.log(data[i].code['buckets'][0]['key']);
			
			 objs[data[i].countryCode]  = obj;
			$scope.countries.push(obj);
			 }
		})(i);
		
		//$scope.value =  $scope.obj;
		//console.log($scope.obj);
		$scope.map = {
		responsive : true,
		scope: 'world',
				  options: {
					 width:750,
					 staticGeoData : false,
					legendHeight: 200,
					legendwidth: 300					// optionally set the padding for the legend
				  },fills: {
					 defaultFill: '#DDDDDD'
		},
		data:objs,
		geographyConfig: {
							highlighBorderColor: '#EAA9A8',
							highlighBorderWidth:3,
							popupTemplate:function(geo, data) {
								  console.log(geo.properties);
								  if(data != null){
									  $rootScope.value = data.numberOfThings;
									  return ['<div class="hoverinfo"><strong>',
										'Attacks ' + geo.properties.name,
										': ' + data.numberOfThings,
										'</strong></div>'].join('');
										
								  }else{
									  $rootScope.value = "";
									  return ['<div class="hoverinfo"><strong>',
										'' + geo.properties.name,
										'</strong></div>'].join('');
									  return geo.properties.name;
								  }  
							}
					}
				};
		
				$scope.mapPlugins = {
					bubbles: null,
					customLegend: function(layer, data, options) {
						var html = ['<ul class="list-inline">'],
						label = '';
						for (var fillKey in $scope.countries) {
							if(fillKey <= 9){
								html.push('<li class="key" ',
								  'style="border-top: 10px solid ' + $scope.countries[fillKey].color + '">',
								  $scope.countries[fillKey].numberOfThings,
								  '</li>');
							}
						}
						html.push('</ul>');
						d3.selectAll(".datamaps-legend").html("");
						d3.select(this.options.element).append('div')
					  .attr('class', 'datamaps-legend')
					  .html(html.join(''));
					}
				};
				$scope.mapPluginData = {
				  bubbles: [{name: 'Bubble 1', latitude: 21.32, longitude: -7.32, radius: 0, fillKey: 'gt500'}]
				};
	
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
						$scope.countries,$scope.obj = undefined;
						$scope.countries = []; $scope.obj ={};
		crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries?from="+d1+"&to="+d2,function(data, status){
			ngProgress.complete();
			$scope.countries,$scope.obj = undefined;
			$scope.countries = []; $scope.obj ={};
			$scope.map = undefined;
			getData(data);
		}, function(error){
			console.log(error);
		});
			/*
				utilityMethods.commonElasticQuery(utilityMethods.globalCountQueryDateTime(d1,d2), "", function(resp){
						ngProgress.complete();
						
				console.log(resp.aggregations.Time.Country.buckets);
				getData(resp.aggregations.Time.Country.buckets);
			},function(error){console.log(error)});
			*/	
				
	  };
	  
		function countryClick(country) {
			if($rootScope.value == ""){
				
			}else{
			$rootScope.$apply(function() {
			 $state.go("app.CountryIps", {cName: country.properties.name, cCode:country.id});
			});
			}
		}

	$scope.updateActiveGeography = function(geography) {
		$scope.stateName = geography.properties.name;
		$scope.stateCode = geography.id;
		console.log($scope.stateName);
		console.log(geography.id);
		countryClick(geography);
	//$location.path("/CountryIps/" + $scope.stateName);	
	};
});
 
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

app.controller('InternalThreatCtrl', [ '$scope', '$http', '$location', '$stateParams',"ngProgress","crudSrv","utilityMethods","$state", function($scope, $http, $location, $stateParams, ngProgress, crudSrv, utilityMethods, $state) {
			
		$scope.showIp = false;
		$scope.showMap = true;
		$scope.countryName = $stateParams.ID;
		$scope.ipAddress =$stateParams.IP;

		$scope.local_icons = {
        default_icon: {},
        leaf_icon: {
            iconUrl: 'img/hostel_0star.png',
            iconSize:     [24, 24], // size of the icon  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        },
        resturant_icon: {
             iconUrl: 'img/resturant.png',
            iconSize:     [24, 24], // size of the icon  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relat
        },
        orange_leaf_icon: {
            iconUrl: 'examples/img/leaf-orange.png',
            shadowUrl: 'examples/img/leaf-shadow.png',
            iconSize:     [38, 95],
            shadowSize:   [50, 64],
            iconAnchor:   [22, 94],
            shadowAnchor: [4, 62]
        }
    };

    angular.extend($scope, {
        icons: $scope.local_icons
    });
		

		
			ngProgress.start();
			angular.extend($scope, {
                center: {
                    lat: 41.575330,
                    lng: 13.102411,
                    zoom: 14
                }, layers: {
                    baselayers: {
                        googleRoadmap: {
                            name: 'Google Streets',
                            layerType: 'ROADMAP',
                            type: 'google'
                        }
                    }
                }
            });
		$scope.markers = {};
		crudSrv.getResults("json/internal_view.json", function(data, status) {
		ngProgress.complete();
		$scope.country = data;
		var markerData = data['countryip'];
		console.log(data);
		var lat = parseFloat(markerData[1]['latitude']);
		var lon = parseFloat(markerData[1]['longitude']);
		console.log(lat, lon);
		$scope.center = {
			lat: lat,
			lng: lon,
			zoom: 10
		};

		$scope.markers = [];
		utilityMethods.countMarkers($scope, markerData);
	}, function(data, status) {
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});


	$scope.$on("leafletDirectiveMarker.click", function(event, args) {
		console.log(event);
		console.log(args);
		var title = args['model']['label']['message'];

		$state.go("app.showIp", {
			ID: $scope.countryName,
			IP: title
		});
	});
			

       }]);

app.controller('DetailIpCtrl', [ '$scope', '$http', '$location', '$stateParams',"ngProgress","crudSrv","utilityMethods","$state", "rootURL","$filter", function($scope, $http, $location, $stateParams, ngProgress, crudSrv, utilityMethods, $state, rootURL, $filter) {

		$scope.countryName = $stateParams.ID;
		$scope.ipAddress =$stateParams.IP; 
		angular.extend($scope,{
                center: {
                    lat: 41.575330,
                    lng: 13.102411,
                    zoom: 14
                }, layers: {
                    baselayers: {
                        googleRoadmap: {
                            name: 'Google Streets',
                            layerType: 'ROADMAP',
                            type: 'google'
                        }
                    }
                },
				 defaults: {
					scrollWheelZoom: false
			}
			
		});
		
		crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/geo-info?size=10",function(data, status){
				console.log(data);
			   $scope.country = data;
			   $scope.country.srcCountryCode = $scope.country.srcCountryCode.toLowerCase();
			   $scope.statteCode = $scope.country.srcCountryCode.toUpperCase();
			ngProgress.complete();			
			$scope.center = {
				lat: parseFloat(data.geoPoint.lat),
				lng: parseFloat(data.geoPoint.lon),
				zoom: 10
			};
			$scope.markers = {
					    m1: {
                        lat: parseFloat(data.geoPoint.lat),
                        lng:  parseFloat(data.geoPoint.lon)
                    }
				 };
			console.log($scope.center);	
		});
		
		$scope.reload = function(){
			 $state.go("app.CountryIps", {cName:  $scope.country.srcCountry, cCode:$scope.statteCode},{reload:true});
		};
	
		
			$scope.showIp = false;
			$scope.showMap = true;
			ngProgress.start();
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/analysis",function(data, status){
				console.log(data);
			   $scope.analysis = data;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd HH:mm");
					 $scope.analysis.lastSeen= $filter('date')($scope.analysis.lastSeen ,"yyyy-MM-dd HH:mm");
			
			});	
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/activity-summary",function(data, status){
				console.log(data);
			   getBar(data);
			   
			},function(data){
				console.log(data);
			});	
			
			function getBar(data){
				$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						if(elem['category'] == "Total Attacks"){
								
						}else{	
						$scope.pieChartArray.push({
							name: elem['category'],
							y: parseInt(elem['hits'])
						});
						$scope.categories.push(elem['category']);
						}
					});
			$scope.chartSeries = [{
			name: "Activity Summary",
			colorByPoint: true,
			data: $scope.pieChartArray
			}];
		
		$scope.barConfig = utilityMethods.chartObjs($scope.chartSeries, 'Activity Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> {point.y}</span>',false, $scope.categories);
		};
			

			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/activity-pulse",function(data, status){
				console.log(data);
			   getData(data);
			
			},function(data){
				console.log(data);
			});	
			
			function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						//	var a = $filter('date')(elem['x-time'] ,"yyyy-MM-dd HH:mm");
						var date = new XDate(elem['x-time']);
			      		date = date.toString('hh:mm tt, dd MMM yyyy');
						console.log(date);
						$scope.pieChartArray.push({
						
							name: elem['x-time'],
							y: parseInt(elem['y-hits'])
						});
						$scope.categories.push(elem['x-time']);
					});
		
		$scope.chartSeries = [{
			name: "Activity",
			colorByPoint: false,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartLineWithoutArea($scope.chartSeries, 'Activity Pulse', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{point.y}</span>',false, $scope.categories);
		
		};
				
			$scope.viewIPHistory = function(country, ip){
				console.log(ip);
				crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/history", function(data, status){
				ngProgress.complete();
				console.log(data);
				$scope.data = data;
				$scope.showIp = true;
				$scope.showMap = false;
			}, function(data,status){
				ngProgress.complete();
				 console.log("fail");
				utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
					
			};
			
			$scope.viewMap = function(){
				$scope.showIp = false;
				$scope.showMap = true;
			};
		
       }]);
	   
app.controller('IPHistoryCtrl', [ '$scope', '$http', '$location', '$routeParams',"ngProgress","crudSrv","utilityMethods", function($scope, $http, $location, $routeParams, ngProgress, crudSrv, utilityMethods) {
			
			console.log($routeParams.IP);
			console.log($routeParams.country);
			$scope.countryName = $routeParams.country;
			$scope.ipAddress =$routeParams.IP; 
			
			  ngProgress.start();
			
			angular.extend($scope, {
                center: {
                    lat: 41.575330,
                    lng: 13.102411,
                    zoom: 6
                }
				
            });
			
			crudSrv.getResults("../Triam sep/json/ip_history.json", function(data, status){
				ngProgress.complete();
				$scope.data = data['categorization'];
				console.log(data);
				 $scope.center = {
						 lat: 30.22,
						 lng: 70.22,
						 zoom: 6
					};
					$scope.markers = {
					    m1: {
                        lat: 30.22,
                        lng: 70.22
                    }
				   };
				
			}, function(data,status){
				ngProgress.complete();
				 console.log("fail");
				  
				utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});

       }]);   
	   
app.controller('ReconnaissanceCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, $state) {

		$scope.countryName = $stateParams.country;
		$scope.attack =$stateParams.attack; 
		$scope.view = "country";		
		var ip = "58.65.179.176";		
		ngProgress.start();
			$scope.center ={
				lat: 41.5061,
				lng: 13.85,
				zoom: 6
			};
			
		$scope.markers = {};
		crudSrv.getResults("../src/json/reconnaissance.json", function(data, status){
			ngProgress.complete();
			$scope.country = data;
			var markerData = data['countryip'];
				var lat = parseFloat(markerData[0]['latitude']);
				var lon = parseFloat(markerData[0]['longitude']);
				$scope.center = {
						 lat: lat,
						 lng: lon,
						 zoom: 6
					};
                   
					$scope.markers = [];
				    utilityMethods.countMarkers($scope,markerData);
		
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


	
});


app.controller('DatabaseCtrl', function($scope, $rootScope, $routeParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods) {
	
	       console.log($routeParams.country);
		   console.log($routeParams.attack);
			var ip = "58.65.179.176";		
			ngProgress.start();
			$scope.center ={
                    lat: 41.5061,
                    lng: 13.85,
                    zoom: 6
				};
			
			 crudSrv.getResults("../Triam sep/json/database.json", function(data, status){
				ngProgress.complete();
				$scope.db = data;
				var markerData = data['countryip'];
				console.log(data);
				var lat = parseFloat(markerData[0]['latitude']);
				var lon = parseFloat(markerData[0]['longitude']);
				console.log(lat,lon);
				
				 $scope.center = {
						 lat: lat,
						 lng: lon,
						 zoom: 6
					};
                   
					$scope.markers = [];
				     utilityMethods.countMarkers($scope,markerData);
			}, function(data,status){
				ngProgress.complete();
				utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
			
			$scope.$on("leafletDirectiveMarker.click", function(event, args){
                console.log(event);
				console.log(args);
				var title = args['model']['label']['message'];
				$location.path("/CountryIps/" + $routeParams.country + "/ip/" + title);
                
            });

});
   
   
app.controller('SSHCtrl', function($scope, $rootScope, $routeParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods) {
	
	       console.log($routeParams.country);
		   console.log($routeParams.attack);
	
			 var ip = "58.65.179.176";		
	   ngProgress.start();
	   
				$scope.center ={
                    lat: 41.5061,
                    lng: 13.85,
                    zoom: 6
				};
				
				$scope.markers = {};
			 
			 crudSrv.getResults("../Triam sep/json/ssh_attacks.json", function(data, status){
				ngProgress.complete();
				//$scope.ssh = data;
				var markerData = data['countryip'];
				console.log(data);
				var lat = parseFloat(markerData[0]['latitude']);
				var lon = parseFloat(markerData[0]['longitude']);
				console.log(lat , lon);
				
				 $scope.center = {
						 lat: lat,
						 lng: lon,
						 zoom: 6
					};
                   
					$scope.markers = [];
				     utilityMethods.countMarkers($scope,markerData);
				
				
			}, function(data,status){
				ngProgress.complete();
				utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
		
			
			$scope.$on("leafletDirectiveMarker.click", function(event, args){
                console.log(event);
				console.log(args);
				var title = args['model']['label']['message'];
				$location.path("/CountryIps/" + $routeParams.country + "/ip/" + title);
                
            });

	});  
	app.controller('AppExploitCtrl', function($scope, $rootScope, $routeParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods) {
	
	       console.log($routeParams.country);
		   console.log($routeParams.attack);
	
			 var ip = "58.65.179.176";		
	   ngProgress.start();
	   
			var markersData = [
                {"loc":[41.575330,15.102411], "title":"aquamarine"},
                {"loc":[41.575730,13.002411], "title":"black"},
                {"loc":[41.807149,13.162994], "title":"blue"},
                {"loc":[41.507149,13.172994], "title":"chocolate"},
                {"loc":[41.847149,14.132994], "title":"coral"},
                {"loc":[41.219190,13.062145], "title":"cyan"},
                {"loc":[41.344190,13.242145], "title":"darkblue"},
                {"loc":[41.679190,13.122145], "title":"darkred"},
                {"loc":[41.329190,13.192145], "title":"darkgray"},
                {"loc":[41.379290,13.122545], "title":"dodgerblue"},
                {"loc":[41.409190,13.362145], "title":"gray"},
                {"loc":[41.794008,10.583884], "title":"green"},
                {"loc":[41.805008,12.982884], "title":"greenyellow"},
                {"loc":[41.536175,13.273590], "title":"red"},
                {"loc":[41.516175,13.373590], "title":"rosybrown"},
                {"loc":[41.506175,13.173590], "title":"royalblue"},
                {"loc":[41.836175,13.673590], "title":"salmon"},
                {"loc":[41.796175,13.570590], "title":"seagreen"},
                {"loc":[41.436175,16.573590], "title":"seashell"},
                {"loc":[41.336175,13.973590], "title":"silver"},
                {"loc":[41.236175,13.273590], "title":"skyblue"},
                {"loc":[41.546175,13.473590], "title":"yellow"},
                {"loc":[41.239190,13.032145], "title":"white"}
            ];
	
				$scope.center ={
                    lat: 41.5061,
                    lng: 13.85,
                    zoom: 6
				};
				
				$scope.markers = {};
			 
			 crudSrv.getResults("../Triam sep/json/application_exp.json", function(data, status){
				ngProgress.complete();
				$scope.exploit = data;
				var markerData = data['countryip'];
				console.log(data);
				var lat = parseFloat(markerData[0]['latitude']);
				var lon = parseFloat(markerData[0]['longitude']);
				console.log(lat , lon);
				
				 $scope.center = {
						 lat: lat,
						 lng: lon,
						 zoom: 6
					};
                   
					$scope.markers = [];
				     utilityMethods.countMarkers($scope,markerData);
				   					
					 
				
			}, function(data,status){
				ngProgress.complete();
				utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
		
			
			$scope.$on("leafletDirectiveMarker.click", function(event, args){
                console.log(event);
				console.log(args);
				var title = args['model']['label']['message'];
				$location.path("/CountryIps/" + $routeParams.country + "/ip/" + title);
                
            });
		
});   

app.controller('VirusCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL, $state) {

	$scope.countryName = $stateParams.virus;
	console.log($stateParams.attack);
	$scope.pieChartArray = [];
	var ip = "58.65.179.176";
	ngProgress.start();
	$scope.center = {
		lat: 41.5061,
		lng: 13.85,
		zoom: 6
	};

	$scope.markers = {};

	crudSrv.getResults("json/virus_infection.json", function(data, status) {
		ngProgress.complete();
		var virus = data['malwares'];
		var markerData = data['countryip'];
		virus.forEach(function(elem, i) {
			$scope.pieChartArray.push({
				name: elem['malware'],
				y: parseInt(elem['downloads'])
			});
		});

		$scope.chartSeries = [{
			name: "Downloads",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];

		$scope.chartConfig = utilityMethods.chartObj($scope.chartSeries, 'Most Malwares Detected', '<span style="font-size:10px">{series.name}(%): {point.percentage:.2f}%</span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>');
		$scope.chartConfig['options']['plotOptions']['pie']['events'] = {
			click: function(event) {
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.y
				};
				console.log(malwareName);
				
				
				crudSrv.getResults("json/hash.json", function(data, status) {
					console.log(data);
					$scope.hashes = data.hashes;
				}, function(data, status) {
					
					$scope.hashes = [];
					utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
				
				
				/*
				crudSrv.createRequest(rootURL.url.baseURL + "malwares/", malwareName, function(data, status) {
					console.log(data);
					$scope.hashes = data;
				}, function(data, status) {
					$scope.hashes = [];
					utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
				});
				*/
			}
		};


		console.log(data);
		var lat = parseFloat(markerData[0]['latitude']);
		var lon = parseFloat(markerData[0]['longitude']);
		console.log(lat, lon);

		$scope.center = {
			lat: lat,
			lng: lon,
			zoom: 6
		};

		$scope.markers = [];
		utilityMethods.countMarkers($scope, markerData);
	}, function(data, status) {
		ngProgress.complete();
		utilityMethods.showMsgOnTop("Server responded with an error: " + status, "danger", 3000);
	});


	$scope.$on("leafletDirectiveMarker.click", function(event, args) {
		console.log(event);
		console.log(args);
		var title = args['model']['label']['message'];
		$state.go("app.showIp", {ID: $scope.countryName, IP: title});
		

	});

});

//  -------------------------------------------   Hashes  Controller  ------------------------------
app.controller('MainHashCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {

	$rootScope.ctName = $stateParams.country;
	$rootScope.ctCode = $stateParams.cCode;
	
	console.log($stateParams.hash);
	$scope.pieChartArray = [];
	var ip = "58.65.179.176";
	ngProgress.start();
	$scope.markers = {};
	$scope.nav = [];
	
	crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/cuckoo-analysis?hash="+$stateParams.hash, function(data, status) {
		ngProgress.complete();
		console.log(data);
		if(data.length !=0){
			$scope.data = data[0];
		data = data[0];	
		$scope.target = data['target']['file'];
		$scope.behavior = data['behavior'];
		$scope.network = data['network'];
		$scope.stat = data['statistics'];
		$scope.scans =[];
	//	$scope.scans = utilityMethods.objToArray(data['virustotal']['scans']);
		console.log($scope.scans);
		var scan = data['virustotal']['scans'];
		
		for(var key in scan)
		{
			var res = scan[key]['result'];
			var update = scan[key]['update'];
			console.log(res, update);
			var scans = {virus:key, res:res, upd:update};
			$scope.scans.push(scans);
		}
		
		console.log($scope.scans);
		for(var key in data){
			console.log(key);
			if(key == "debug" || key == "strings" || key == "target" || key == "procmemory" || key == "static" || key == "malscore" || key == "malfamily" || key == "virustotal_summary" || key == "shots" || key == "dropped")  {
				
			}else{
					$scope.nav.push(key);
			}
		}
		$scope.oneAtATime = true;
		$scope.groups = [];
		$scope.groups = data['signatures'];

		if($stateParams.fold != undefined){
			$rootScope.list_div = $stateParams.fold; 
		}
	
		}
		console.log($scope.nav);
		$scope.$on("leafletDirectiveMarker.click", function(event, args) {
		console.log(event);
		console.log(args);
		var title = args['model']['label']['message'];
		$state.go("app.showIp", {ID: $scope.countryName, IP: title});

	});

	  $scope.clickMe = function(click)
	  {
		  $rootScope.list_div = click; 
	  }
	
	});
});

//  -------------------------------------------   PDF Controller  ------------------------------
app.controller('MainReportCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {

		$scope.selection=[];
		$scope.ob = true;
		$scope.obj = {};
		// toggle selection for a given employee by name
		$scope.toggleSelection = function toggleSelection(employeeName) {
		for (name in employeeName.val) {
                      nam = name;
					  console.log(nam);
				};
		   $scope.obj.nam;
		   console.log($scope.obj);
		
		$scope.checkboxModel = {
			attackedOSs :true
		};
		
		
		if($scope.selection.length == 0){
			
			 var ob = {"employeeName":true};
			$scope.selection.push(employeeName.val);
			console.log(employeeName.val);
			console.log($scope.selection);
		}else{
			var nam;
				for (name in employeeName.val) {
                      nam = name;
				}
			for(var i = 0, len = $scope.selection.length; i < len; i++) {
				for (names in $scope.selection[i]) {
						if(names === nam){
							$scope.ob = false;
							 $scope.selection.splice(i,1);
							 break;
						}
					}
				}
			if( $scope.ob == true){
				$scope.selection.push(employeeName.val);
				console.log($scope.selection);
			}	
		}
			
			/*
			var ob = {employeeName : true};
	    var idx = $scope.selection.indexOf(employeeName);
		console.log(idx);
	    // is currently selected
	    if (idx > -1) {
	      $scope.selection.splice(idx, 1);
	    }

	    // is newly selected
	    else {
			console.log(employeeName);
			
	      $scope.selection.push(employeeName);
	    }
		*/
	  };
	   
	   $scope.probing = [
							{name:'Probed Countries', val:"probedCountries"},
							{name:'Probed Countries Unique IP', val:"probedCountriesUniqueIPs"},
							{name:'Probed IP', val:"probedIPs"}
						];
	 
	  	$scope.malware=[{name:'Malware Countries', val:{"malwareCountries":true}},
							{name:'Malware IP', val:{"malwareIPs":true}},
							{name:'Malware IP 10', val:{"malwareIPs10":true}},
							{name:'Detected Malwares', val:{"detectedMalware":true}},
							{name:'Detected Malware Hashes', val:{"detectedMalwareHashes":true}},
							{name:'Cnc IP', val:{"cncIPs":true} },
							{name:'Cnc Domains', val:{"cncDomains":true} }
						];
							
		$scope.sip = [{name:'SIP Countries', val:{"sipCountries":true}},
							{name:'SIP Attacks', val:{"sipAttacks":true}},
							{name:'SIP Registrar IP', val:{"sipRegistrarIPs":true}},
							{name:'SIP Option IP', val:{"sipOptionIPs":true}},
							{name:'SIP Proxy IP', val:{"sipProxyIPs":true}},
							{name:'SIP Tools', val:{"sipTools":true} }
						];

		$scope.web = [
						{name:'Web Countries', val:{"webCountries":true}},
						{name:'Web IP', val:{"webIPs":true}},
						{name:'Web Severities', val:{"webSeverities":true}},
						{name:'Web Attacks', val:{"webAttacks":true}}
					];

		$scope.brute = [
						{name:'SSH Countries', val:{"sshCountries":true}},
						{name:'SSH IP', val:{"sshIPs":true}},
						{name:'SSH Username', val:{"sshUsernames":true}},
						{name:'SSH Password', val:{"sshPasswords":true}},
						{name:'SSH Tools', val:{"sshTools":true}}
					];
					
			
		$scope.global = [
						{name:'Attacked OS', val:{"attackedOSs":true}},
						{name:'Vulnerabilities', val:{"vulnerabilities":true}},
						{name:'Attacked Protocols', val:{"attackedProtocols":true}}
					];		
																
		moment.locale('en');
      	$scope.data = {
        guardians: [
          {
            name: 'Peter Quill',
            dob: null
          },
          {
            name: 'Groot',
            dob: null
          }
        ]
      };

	  $scope.produceReport = function(){
		  console.log($scope.checkboxModel);
		  
		  var resultObject = $scope.selection.reduce(function(result, currentObject) {
			for(var key in currentObject) {
				if (currentObject.hasOwnProperty(key)) {
				result[key] = currentObject[key];
				}
			}
				return result;
		}, {});

		console.log(resultObject);
		  
			console.log(JSON.stringify($scope.selection));
	  };
	  
      $scope.checkboxOnTimeSet = function () {
        $scope.data.checked = false;
      };

      $scope.inputOnTimeSet = function (newDate) {
        // If you are not using jQuery or bootstrap.js,
        // this will throw an error.
        // However, can write this function to take any
        // action necessary once the user has selected a
        // date/time using the picker
        $log.info(newDate);
        $('#dropdown3').dropdown('toggle');
      };

      $scope.getLocale = function () {
        return moment.locale();
      };

      $scope.setLocale = function (newLocale) {
        moment.locale(newLocale);
      };


      $scope.guardianOnSetTime = function ($index, guardian, newDate, oldDate) {
        $log.info($index);
        $log.info(guardian.name);
        $log.info(newDate);
        $log.info(oldDate);
        angular.element('#guardian' + $index).dropdown('toggle');
      };

      $scope.beforeRender = function ($dates) {
        var index = Math.ceil($dates.length / 2);
        $log.info(index);
        $dates[index].selectable = false;
      };

      $scope.config = {
        datetimePicker: {
          startView: 'year'
        }
      };

      $scope.configFunction = function configFunction() {
        return {startView: 'month'};
      };
		

});

//  -------------------------------------------   dashboard Attack  ------------------------------
app.controller('DashBoardMalware', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {

	$scope.countryName = $stateParams.country;
	console.log($stateParams.hash);
	$scope.pieChartArray = [];
	var ip = "58.65.179.176";
	ngProgress.start();
	$scope.markers = {};
	$scope.nav = [];
	
	crudSrv.getResults("json/Malware_IP_dash.json", function(data, status) {
		console.log(data);
		ngProgress.complete();
		$scope.data = data;
		
	});
});

app.controller('DashBoardAttackInfo', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {
		$scope.deleteModal = false;
		$scope.counts = $stateParams.counts;
		$scope.type = $stateParams.type;
		var limit = 20;
		if ($scope.counts == 0) {
			$scope.type = "no";
		} else {
			$scope.type = $stateParams.type;
			$scope.types = $stateParams.type;
			if ($scope.type == "db")
				$scope.type = "database";
		}

		$scope.sort = function(keyname) {
			$scope.sortKey = keyname; //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

		$scope.showModal = function(item) {
			$scope.modalType = $scope.type;
			console.log()
			$scope.deleteModal = true;
			$scope.value = item;
			console.log(item);
		};

		$scope.showModalHide = function() {
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
		};
		$scope.data = [];
		if ($scope.counts <= 20) {
			$scope.totalPerPage = 20;
			var pageNumber = 0;
			crudSrv.getResults(rootURL.url.baseURL + "attacks/" + $scope.types + "/recent-attack-count?page=" + pageNumber + "&limit=" + $scope.counts, function(data, status) {
				$scope.data = data;
				console.log(data);
				ngProgress.complete();
			}, function(error) {
				console.log(error);
			});
		} else {

			$scope.pagination = {
				current: 1
			};

			$scope.totalCount = 0;
			$scope.totalPerPage = 20;
			getResultsPage(1);
		}

		$scope.pageChanged = function(newPage) {
			getResultsPage(newPage);
		};

		function getResultsPage(pageNum) {
			pageNum = pageNum - 1;
			if (pageNum >= 1) {
				var diff = $scope.counts - (pageNum * 20);
				console.log(diff);
				if (diff <= 19) {
					limit = diff;
				} else {
					limit = 20;
				}
			} else {
				limit = 20;

			}

			crudSrv.getResults(rootURL.url.baseURL + "attacks/" + $scope.types + "/recent-attack-count?page=" + pageNum + "&limit=" + limit, function(data, status) {
				ngProgress.complete();
				$scope.totalCount = $scope.counts;
				console.log($scope.totalCount, $scope.pagination.current);
				$scope.data = [];
				$scope.data = data;

				$scope.safeApply();
				console.log(data);
			}, function(error) {
				console.log(error);
			});

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

	/*
	$scope.deleteModal = false;
	$scope.counts = $stateParams.counts;
	$scope.type = $stateParams.type;
	if($scope.counts == 0){		
		$scope.type = "no";	
	}else{
			$scope.type = $stateParams.type;
			$scope.types = $stateParams.type;
		if($scope.type == "db")
				$scope.type =  "database";
		}
	
		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}
	
		$scope.showModal = function(item){
			$scope.modalType = $scope.type;
			console.log()
			$scope.deleteModal = true;
			$scope.value = item;
			console.log(item);
		};

		$scope.showModalHide = function(){
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
			
		};
			ngProgress.start();
			var pageNumber = 0;
		   crudSrv.getResults(rootURL.url.baseURL +"attacks/"+ $scope.types+"/recent-attack-count?page="+ pageNumber+"&limit="+$scope.counts,function(data, status){
			$scope.data = data;
				console.log(data);
				ngProgress.complete();
			}, function(error){
			console.log(error);
			});
		*/
});

app.controller('TestDashBoard', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {
	$scope.deleteModal = false;
	$scope.counts = $stateParams.counts;
	$scope.type = $stateParams.type;
	var limit = 20;
	if($scope.counts == 0){		
		$scope.type = "no";	
	}else{
			$scope.type = $stateParams.type;
			$scope.types = $stateParams.type;
		if($scope.type == "db")
				$scope.type =  "database";
		}
	
		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}
	
		$scope.showModal = function(item){
			$scope.modalType = $scope.type;
			console.log()
			$scope.deleteModal = true;
			$scope.value = item;
			console.log(item);
		};

		$scope.showModalHide = function(){
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;			
		};
				$scope.data = [];
			if($scope.counts <= 20){
				$scope.totalPerPage = 20; 
				var pageNumber = 0;
				 crudSrv.getResults(rootURL.url.baseURL +"attacks/"+ $scope.types+"/recent-attack-count?page="+ pageNumber+"&limit="+$scope.counts,function(data, status){
			$scope.data = data;
			console.log(data);
				ngProgress.complete();
			}, function(error){
			console.log(error);
			});
			}else{
				
				$scope.pagination = {
					current: 1
				};
				
				$scope.totalCount = 0;
				$scope.totalPerPage = 20; 
				getResultsPage(1);
			}
			
			
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				  if( pageNum >= 1){
					  var diff = $scope.counts -(pageNum * 20);
					  console.log(diff);
					  if(diff <= 19){
						  limit = diff;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL +"attacks/"+ $scope.types+"/recent-attack-count?page="+ pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();
				 $scope.totalCount = $scope.counts;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				});
		
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
		
});