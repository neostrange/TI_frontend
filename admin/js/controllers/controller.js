app.controller('MainCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $timeout, $websocket, $interval, $state, $window, $filter) {
	$scope.message = 'This is our Home Page';
	$scope.showModals = false;
	var stompClient;
	isAliveConn =0; 
	var format, typeobj;
	var i, cint, starts,stopTime ;
	$scope.criteria ={};
	$scope.countAttack ={};
		$scope.date = new Date();
		$scope.currentDate = $filter('date')($scope.date ,"hh:mm:ss, dd MMM yyyy");
	    $scope.passTime  = $scope.date.getTime();
		console.log($scope.passTime);
		function updateTime(object){
			var a = new Date();
			$scope.changeTime =$filter('date')(a,"hh:mm:ss, dd MMM yyyy");
		};
		 stopTime = $interval(updateTime, 1000);
	
	$scope.chooseValue = function(object){
		//console.log(object);
		if(object) {
			//console.log(typeof object);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/counts?filter="+object, function(data, status) {
		//	console.log(data);
			if(object === "1h"){
				var d = new Date();
				var d2 = new Date();
				 d2.setHours(d.getHours() - 1);
				// console.log(d2);
			 $scope.passTime = d2.getTime();
			 console.log($scope.passTime);
			//	$scope.currentDate = $filter('date')(d2 ,"hh:mm:ss, dd MMM yyyy");
			}else if(object == "1w"){
				var d = new Date();
				d.setDate(d.getDate()-7);
				//$scope.currentDate = $filter('date')(d ,"hh:mm:ss, dd MMM yyyy");
				$scope.passTime = d.getTime();
			}else if(object == "1m"){
					var d = new Date();
					d.setDate(d.getDate()-30);
					$scope.passTime = d.getTime();;
					console.log($scope.passTime);
				//$scope.currentDate = $filter('date')(d ,"hh:mm:ss, dd MMM yyyy");
			}else{
				if(object === "1d"){
					var d = new Date();
					d.setDate(d.getDate()-1);
					//$scope.currentDate = $filter('date')(d ,"hh:mm:ss, dd MMM yyyy");
						$scope.passTime =d.getTime();
				}
			}
			
			$scope.countAttack = data;
			$scope.db = $scope.countAttack.db;
			$scope.prob = $scope.countAttack.probing;
			$scope.mal = $scope.countAttack.malware;
			$scope.wb = $scope.countAttack.web;
			$scope.ssh = $scope.countAttack.ssh;
			$scope.sp = $scope.countAttack.sip;
			}, function(error) {
			console.log(error);
			});
			
		}else{
			var d = new Date();
			$scope.passTime =d.getTime();
			//$scope.currentDate = $filter('date')($scope.date ,"hh:mm:ss, dd MMM yyyy");	
			$scope.db = 0;
			$scope.prob = 0;
			$scope.mal = 0;
			$scope.wb = 0;
			$scope.ssh = 0;
			$scope.sp = 0;
			$scope.criteria =undefined;
			$scope.criteria ={};
		}
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
			
	
	$scope.showModal = function(item){
		console.log(item);
		$scope.detail = item.data.obj;
		crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.data.Ip + "&dstPort=" +$scope.detail.dstPort+"&dateTime="+$scope.detail.dateTime, function(data, status) {
				$scope.network = data;
				console.log(data);
				ngProgress.complete();
				$scope.modalType = item.data.type.toUpperCase();
			//console.log($scope.modalType);
			$scope.showModals = true;
			$scope.detail = item.data.obj;
			//console.log($scope.detail);
			}, function(error) {
				$scope.showModals = true;
				$scope.detail = item.data.obj;
				console.log(error);
			});
		
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+ item.data.Ip + "/analysis",function(datas, status){
				console.log(datas);
			   $scope.analysis = datas;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			});
			
		};
		
		$scope.showModalHide = function(){
			$scope.showModals = false;
			$scope.detail = undefined;
			$scope.modalType = undefined;
		};
	
	
	function IPCountryStart(){
		var d = new Date();
		var d2 = new Date();
		d2.setSeconds(d.getSeconds() - 50);
		console.log(d);
		console.log(d2);
		var a2 = $filter('date')(d2,"yyyy-MM-dd HH:mm:ss");
		var fromTime = utilityMethods.addTInDateTime(a2);
		crudSrv.getResults(rootURL.url.baseURL + "attacks/all/countries?size=10&minCount=1&from="+fromTime, function(data, status) {
			ngProgress.complete();
			//console.log(data);
			getCountries(data);
		}, function(error) {
			console.log(error);
		});
		
		crudSrv.getResults(rootURL.url.baseURL + "attacks/all/ips?size=10&minCount=1&from="+fromTime, function(data, status) {
			//console.log(data);
			getIPs(data);
		}, function(error) {
			console.log(error)
		});
	};
	
	function searchName(nameKey, myArray){
	console.log(nameKey, myArray);
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].country == nameKey) {
            return myArray[i];
			}
		}
	};

	
	function getCountries(data) {
		$scope.obj = [];
		$scope.categories = [];
		$scope.searchData = [];
		$scope.chartSeries = [];
		$scope.safeApply();
		data.forEach(function(elem, i) {
			//console.log(elem);
			$scope.obj.push([
				elem['country'],
				parseInt(elem['hits'])
			]);

			$scope.categories.push(elem['country']);
			$scope.searchData.push(elem);
		});

		var result ;
		$scope.chartSeries = [{
			name: "Countries",
			colorByPoint: true,
			data: $scope.obj
		}];
		
		$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'Top Attacking Countries ', '<br/><span style="font-size:10px"> Attacks : {point.y}</span>', false, $scope.categories, "Attacks");
		$scope.safeApply ();
		$scope.chartConfig['options']['plotOptions']['area']['events'] = {
			click: function(event) {
				//console.log(data);
				console.log(event.point);
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.x
				};
				
				console.log(data);
				result = searchName(event.point.name, $scope.searchData);
				console.log(result);
				$window.open("#/app/CountryIps/"+result.country+"/cCode/"+result.countryCode);	
			}
		};
	};
	
	
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
		
		//console.log($scope.ob);
		$scope.chartSeries = [{
			name: "IP Addresses",
			colorByPoint: true,
			data: $scope.ob
		}];

		$scope.difference = utilityMethods.chartLine($scope.chartSeries, 'Top Attacking  IP Addresses', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> Attacks: {point.y}</span>', false, $scope.combs, "Attacks");
		$scope.safeApply ();
		$scope.difference['options']['plotOptions']['area']['events'] = {
			click: function(event) {
				var malwareName = {
					"malware": event.point.name,
					"downloads": event.point.x
				};
				$window.open("#/app/showIps/country/ip/"+event.point.name);	
				/*
				$state.go("app.showIp", {
					ID: "country",
					IP: event.point.name
				});
				*/
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
				right: 40, 
				bottom: 55,
				left: 40
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
					//console.log("stateChange");
				},
				changeState: function(e) {
					//console.log("changeState");
				},
				tooltipShow: function(e) {
					//console.log("tooltipShow");
				},
				tooltipHide: function(e) {
					//console.log("tooltipHide");
				}
			},
			xAxis: {
				axisLabel: 'Time(M)',
				tickFormat: function(d) {
					return d3.time.format('%I:%M:%S %p')(new Date(d))
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
				
				//console.log("!!! lineChart callback !!!");
			}
		},
		title: {
			enable: true,
			text: 'Real-time Attacks frequency',
			"css":{
				"text-align": "center",
				"color":"black"
			}
		}
	};
	
	 d3.select(window).on('resize', function() { location.reload(); });
	 d3.select(window).on('resize', function() {
                    $scope.lineChartOptions.chart.resize();
                });

	
	
	typeobj = {sip:0, malware:0, web:0, probing:0, ssh:0, database:0};
	//console.log(typeobj);
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
	//	console.log(typeobj);
	};

	function start(){
		starts = $interval(function() {
		//console.log("start here ...............");
		var d = new Date();
		var e = d.getTime();
		var m = typeobj;
		//console.log(typeobj);
		getCountTime(m, e);
		typeobj = {sip:0, malware:0, web:0, probing:0, ssh:0, database:0};
		//console.log(typeobj);
		
		var d2 = new Date();
		d2.setSeconds($scope.date.getSeconds() - 30);
		console.log(d);
		console.log(d2);
		var a2 = $filter('date')($scope.date,"yyyy-MM-dd HH:mm:ss");
		var fromTime = utilityMethods.addTInDateTime(a2);
		crudSrv.getResults(rootURL.url.baseURL + "attacks/all/countries?size=10&minCount=1&from="+fromTime, function(data, status) {
			ngProgress.complete();
			//console.log(data);
			getCountries(data);
		}, function(error) {
			console.log(error);
		});
	
		crudSrv.getResults(rootURL.url.baseURL + "attacks/all/ips?size=10&minCount=1&from="+fromTime, function(data, status) {
			//console.log(data);
			getIPs(data);
		}, function(error) {
			console.log(error)
		});
		
		
		}, 30000);
	};
	
	function checkWebSocConAlive(){
			isAliveConn = $interval(function() {
				console.log("in Testing with checkconnec");
				console.log(stompClient);
				if (stompClient.connected == false) {
					startConnectionWebSocket();
			}
				},60000);
	};
	
	
	function startConnectionWebSocket (){
		var socket = new SockJS("http://115.186.132.18:8080/TI/rt/");
		stompClient = Stomp.over(socket);
		stompClient.connect({}, function(frame) {
			stompClient.subscribe('/live/incidents', function(greeting) {
				var mm = JSON.parse(greeting.body);
				var obj =[];
				if(mm.length > 0){
					mm.forEach(function(m){
						var ob = {
						"Ip": m.origin.ip,
						"country-code": m['origin']['countryCode'],
						"name": m['origin']['country'],
						"lat": m.origin.geoPoint.lat,
						"longs": m.origin.geoPoint.lon,
						"type": utilityMethods.getType(m.service, m),
						"port": m.dstPort,
						"affected": {
							"lat": m.destination.geoPoint.lat,
							"longs": m.destination.geoPoint.lon
						},
						"obj":m
						};
						obj.push(ob);
				});	
					getRealTime(obj);
				
				}
			});
				
		});
	};
	
	
	start();
	startConnectionWebSocket();
	checkWebSocConAlive();

	$scope.$on("$destroy", function(event) {
		//	$scope.apis.refresh();
		if (stompClient != null) {
                stompClient.disconnect();
            }
		$interval.cancel(isAliveConn);	
		$interval.cancel(starts);
		$scope.apis.clearElement();
	});
	
	function getCountTime(val, date) {
		//console.log(typeof val.database);
		if( val.malware + val.sip + val.web + val.probing + val.ssh + val.database == 0){
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
		
		 var allPerct = val.malware + val.sip + val.web + val.probing + val.ssh + val.database;
		console.log("All object");
		if( allPerct > 0 ){
			
			$scope.malPerct = Math.floor((val.malware / allPerct) * 100);
			$scope.sipPerct = Math.floor((val.sip / allPerct) * 100);
			$scope.webPerct = Math.floor((val.web / allPerct) * 100);
			$scope.probPerct = Math.floor((val.probing / allPerct) * 100);
			$scope.sshPerct = Math.floor((val.ssh / allPerct) * 100);
			$scope.dbPerct = Math.floor((val.database / allPerct) * 100);
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
		//$scope.safeApply();
		$scope.apis.update();
		}
	};

	
	function getRealTime(data) {
	$scope.arrItem  = [];	
		//console.log($scope.items.length);

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
app.controller('AppSearchCtrl', function($scope, $rootScope, $location, utilityMethods, $state, $cookies, crudSrv, rootURL) {
	
		$scope.header ={};
		$scope.chooseValue = function(criteria){
			var ip = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/
			var te = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
			var p = ip.test(criteria);
			if(p == true){
				 	$state.go("app.showIp", {ID: "ct", IP: criteria});  
			}else{
					$state.go("app.freeSearch", {q: criteria});  
					/*
				crudSrv.getResults(rootURL.url.baseURL +"search?q="+criteria,function(data, status){
					console.log(data);
					},function(error){	
				});
				*/
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			crudSrv.getResults(rootURL.url.baseURL +"attacks/probing/unique-country-ips?size=10",function(data, status){
				//console.log(data);
				
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
	//	console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/probing/unique-country-ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				data.sort(compares);
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
		//	console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ips?minCount=20&size=0",function(data, status){
				//console.log(data);
				ngProgress.complete();
				$scope.data = data;
			}, function(error){
			console.log(error);
		});

		$scope.searchDate = function(){
			var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
				//console.log(d2);
				crudSrv.getResults(rootURL.url.baseURL +"attacks/malware/ips?minCount=20&size=0&from="+d1+"&to="+d2,function(data, status){
				//console.log(data);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//	console.log(data);
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
			//console.log(d1);
			var dd = new Date($scope.date.endDate);
			var d2 = dd.toISOString();
			//console.log(d2);
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
			//console.log(newDate);		
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
				//console.log(data);
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
			//	console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
		crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/names?size=10&from="+d1+"&to="+d2, function(data, status){
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/methods?size=10",function(data, status){
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
			//console.log(d2);
				crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/countries?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
				getData(data);
				},function(error){	
			});
			
			crudSrv.getResults(rootURL.url.baseURL +"attacks/sip/methods?size=10&from="+d1+"&to="+d2,function(data, status){
				//console.log(data);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//console.log(data);
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
				//console.log(d1, $scope.date.startDate);
				var dd = new Date($scope.date.endDate);
				var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
				var d2 = utilityMethods.addTInDateTime(a2);
			//	console.log(d2);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//console.log(data);
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
			name: "Option Flooding Attacks",
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
			//console.log(d1, $scope.date.startDate);
			var dd = new Date($scope.date.endDate);
			var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
			var d2 = utilityMethods.addTInDateTime(a2);
		//	console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/options-flooding-ips?size=10&from="+d1+"&to="+d2, function(data, status){
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
			//console.log(data);
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
			name: "Flooding Proxy Server",
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
	//	console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
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
			//console.log(newDate);		
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
		//	console.log(newDate);		
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
			//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
		crudSrv.getResults(rootURL.url.baseURL + "attacks/sip/tools?size=10&from="+d1+"&to="+d2, function(data, status){
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//	console.log(d2);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/ips?size=10&from="+d1+"&to="+d2, function(data, status){
				ngProgress.complete();
			//	console.log(data);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/categories?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			//console.log(data);
			 getData(data);
			},function(error){
				
			});
				
		};
		
});


app.controller('TopFewWebSevertiesCtrl', function($scope, $rootScope, crudSrv, utilityMethods, ngProgress, rootURL, $filter) {
	$scope.message = 'Top Few Web Severities';
	$scope.heading = "Web-Attacks";
	var data = [];
	$scope.categories = [];
	$scope.date = {};
	
	$scope.d_one_error = { today: false, date_two :false };
	$scope.d_two_error = { today: false , date_one : false};
		$scope.onD1Set = function (newDate,oldDate) {
			//console.log(newDate);		
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
			//console.log(newDate);		
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
		crudSrv.getResults(rootURL.url.baseURL +"attacks/web/severities?size=10",function(data, status){
				//console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			console.log(data);
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
					$scope.pieChartArray.push({
						name: elem['severity'],
						y: parseInt(elem['hits'])
					});		
				$scope.categories.push(elem['severity']);
			});
		
		console.log($scope.categories);
		$scope.chartSeries = [{
			name: "Tools",
			colorByPoint: true,
			data: $scope.pieChartArray
		}];
		
		$scope.chartConfig = utilityMethods.chartLine($scope.chartSeries, 'Top Few Web Severties', '<span style="font-size:10px"></span> <br/><span style="font-size:10px">{series.name}: {point.y}</span>',false, $scope.categories, "Hits");
		
		};
		
	
	
		$scope.searchDate = function(){
			 var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/web/severities?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
			//console.log(data);
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
			//console.log(newDate);		
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
			//console.log(newDate);		
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
				//console.log(data);
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
			//console.log(newDate);		
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
		//	console.log(newDate);		
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
				//console.log(data);
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
	//	console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
	//	console.log(d2);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/ips?size=10&from="+d1+"&to="+d2, function(data, status){
			ngProgress.complete();
		//	console.log(data);
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
			//console.log(newDate);		
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
		//	console.log(newDate);		
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
				//console.log(data);
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
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
	//	console.log(d2);
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
		//	console.log(newDate);		
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
		//	console.log(newDate);		
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
			//	console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						if(elem['username'] == ""){
							elem['username'] = "unknown";
						}
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
	//	console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		//console.log(d2);
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
		//	console.log(newDate);		
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
			//console.log(newDate);		
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
			//	console.log(data);
				ngProgress.complete();
				getData(data);
			}, function(error){
			console.log(error);
		});
		
		function getData(data){
			$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						if(elem['password'] == ""){
							elem['password'] = "unknown";
						}
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
	//	console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
	//	console.log(d2);
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
 
 app.controller('GlobalThreatCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, $window, $state, $filter, rootURL, $anchorScroll) {
	
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
	
	$scope.criteria = "country";	
	$scope.chooseValue = function(object){
		console.log(object);
			if(object == "summary"){
				if($scope.d1){
					var uri = rootURL.url.baseURL + "global/attack-counts?from="+$scope.d1+"&to="+$scope.d2;
					showSummaryAttack(url);
				}else{
					$scope.criteria = "summary";
					var uri = "";
					var url = rootURL.url.baseURL + "global/attack-counts";		
					showSummaryAttack(url);
				}	
			}else{
				if($scope.d1){
					var uri = rootURL.url.baseURL + "global/attacking-countries?from="+$scope.d1+"&to="+$scope.d2;
					showAllCountryAttacks(uri);
				}else{
					var uri = rootURL.url.baseURL + "global/attacking-countries";
					$scope.criteria = "country";
					showAllCountryAttacks(uri);
				}
			}
	};		
	

	$scope.showReset = false;
	ngProgress.start();
	$scope.date ={};
	$scope.d_one_error = { today: false, date_two :false };
	$scope.d_two_error = { today: false , date_one : false};
		$scope.onD1Set = function (newDate,oldDate) {
		//	console.log(newDate);		
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
	
		$scope.obj ={};
		$scope.showResetCountry = function(){
				$scope.d1 = undefined;
				$scope.d2 = undefined;
				$scope.showReset = false;
				$scope.showType = "";
				$scope.date = undefined;
				$scope.date = {};
				$scope.showType = "";
				$scope.criteria = "country";
				crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries",function(data, status){
				ngProgress.complete();
				//console.log(data.length);
				getData(data);
				$scope.criteria = "country";
			//	$scope.safeApply();
				}, function(error){
			console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL + "global/attack-counts",function(data, status){
				console.log(data.length);
				$scope.attackTypes = data;
				$scope.criteria = "country";
			}, function(error){
			console.log(error);
			});
		};
	
	
		function showAllCountryAttacks(url){		
			crudSrv.getResults(url,function(data, status){
			ngProgress.complete();
			//	console.log(data.length);
			$scope.showReset = false;
			$scope.showType = "";
			getData(data);	
			}, function(error){
			console.log(error);
			});
		};
		
			
		function showSummaryAttack(uri){
			crudSrv.getResults(uri,function(data, status){
			$scope.attackTypes = data;
			}, function(error){
			console.log(error);
			});
		};
			var uri = rootURL.url.baseURL + "global/attacking-countries";
				showAllCountryAttacks(uri);
			var url = rootURL.url.baseURL + "global/attack-counts";
			showSummaryAttack(url);
		
	  		function getData (data){
				
				 var objs ={};
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
				for(var i in data){
					if(data[i].key == "Europe"){
					//	console.log("eu"); 
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
			
					//console.log($scope.countries);
					objs[data[i].countryCode]  = obj;
					$scope.countries.push(obj);
				}
			}
		
			 createMap(objs, $scope.countries);
				
					//console.log(mapPlugins);
				
	   //    $scope.safeApply();
	  };
	 
	  function createMap(objs, countries){
		var countrie = [];
			countrie = countries;
			 getCtr(countries);
			console.log(countrie);
		  $scope.map = {
					responsive : true,
					scope: 'world',
				  options: {
					 height:500,
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
							popupTemplate:function(geo, datas) {
								  console.log(datas);
								  if(datas != null){
									  $rootScope.value = datas.numberOfThings;
									  return ['<div class="hoverinfo"><strong>',
										'Attacks ' + geo.properties.name,
										': ' + datas.numberOfThings,
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
		
				d3.select(this.options).selectAll(".datamaps-legend").html("");
				d3.selectAll(".datamaps-legend").html(" ");
				d3.selectAll(".datamaps-legend").remove(" ");			
				console.log($scope.mapPlugins, $scope.mapPluginData);
				$scope.mapPlugins = {
					bubbles: null,
					customLegend: function(layer, data, options) {
						
						console.log(layer, data, options);
						
						var html = ['<ul class="list-inline">'],
						label = '';
						 var allObj = [];
							var allObj = getObject();
							console.log(allObj);
						allObj.forEach(function(elem, i){
							if(i <= 9){
								console.log(elem.numberOfThings);
								html.push('<li class="key" ',
								  'style="border-top: 10px solid ' + elem.color + '">',
								  elem.numberOfThings,
								  '</li>');
							}
						});
						
						html.push('</ul>');
						console.log(html);
						d3.select(this.options.element).append('div')
					  .attr('class', 'datamaps-legend')
					  .html(html.join(''));
					}
				};
				
				
				$scope.mapPluginData = {
				  bubbles: [{name: 'Bubble 1', latitude: 21.32, longitude: -7.32, radius: 0, fillKey: 'gt500'}]
				};
	  };
	 
	
		function getCtr(obj){
			$scope.get = [];
			$scope.get = obj;
			return $scope.get;
		}
		
		function getObject() {
			return $scope.get;
		};
	  
	   $scope.searchDate = function(){
			
			var d = new Date($scope.date.startDate);
			var a = $filter('date')($scope.date.startDate ,"yyyy-MM-dd HH:mm:ss");
			var d1 = utilityMethods.addTInDateTime(a);
			var dd = new Date($scope.date.endDate);
			var a2 = $filter('date')($scope.date.endDate ,"yyyy-MM-dd HH:mm:ss");
			var d2 = utilityMethods.addTInDateTime(a2);
			$scope.obj = undefined;
			 $scope.obj ={};
				$scope.showReset = true;
				$scope.d1 = d1;
                $scope.d2 = d2;				
				crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries?from="+d1+"&to="+d2,function(data, status){
				ngProgress.complete();
				$scope.obj = undefined;
				 $scope.obj ={};
				$scope.map = undefined;
				getData(data);
				}, function(error){
				console.log(error);
				});
			
				crudSrv.getResults(rootURL.url.baseURL + "global/attack-counts?from="+d1+"&to="+d2,function(data, status){
					//console.log(data.length);
					$scope.attackTypes = data;
				}, function(error){
					console.log(error);
				});
				
	  };
	  
		function countryClick(country) {
			if($rootScope.value == ""){
				
			}else{
			$rootScope.$apply(function() {
				
			 $state.go("app.CountryIps", {cName: country.properties.name, cCode:country.id});
			});
			}
		}

		  $scope.$on("$destroy",function handleDestroyEvent() {
			  $scope.countries = [];
			  console.log("map");
               $scope.map = undefined;
			   $scope.mapPlugins = undefined;
			   $scope.mapPlugins = " ";
				$scope.mapPluginData = undefined;
				$scope.map = "null";
				$scope.mapPlugins = undefined;           
		  });	
		
	$scope.updateActiveGeography = function(geography) {
		$scope.stateName = geography.properties.name;
		$scope.stateCode = geography.id;
		//console.log($scope.stateName);
		//console.log(geography.id);
		countryClick(geography);
	//$location.path("/CountryIps/" + $scope.stateName);	
	};

	//////////////////////////////   Attack  Types  //////////////////////		
	$scope.changeView = function (view, hit, index){
		$scope.ind = index;
		console.log(typeof $scope.ind);
		$scope.showType = view;
		$scope.viewType ;
		//	console.log(hit);
			if(hit >= 1){
			if(view == 'Reconnaissance'){
					$scope.viewType ="probing";
					getAttackwithTypes($scope.viewType);
			}
			//$scope.rec(view);
			if(view == "SSH Attacks"){
			
				$scope.viewType ="ssh";
				getAttackwithTypes($scope.viewType);
				
			}
		    if(view == 'Database Attacks'){
				$scope.viewType ="db";
			getAttackwithTypes($scope.viewType);
			}
			if(view == 'Application Exploit Attempts'){
				$scope.viewType ="application";
				getAttackwithTypes($scope.viewType);
			}
			if(view == 'Malware Infection'){
				$scope.viewType ="malware";
				getAttackwithTypes($scope.viewType);
			}
			
			if(view == 'DOS Attacks'){
				$scope.viewType ="net-dos";
				getAttackwithTypes($scope.viewType);
			}			
			if(view == 'Network Policy Violation'){
				$scope.viewType = "net-policy";
				getAttackwithTypes($scope.viewType);
			}
			
			if(view == 'Possible Compromise'){
				$scope.viewType ="net-compromise";
				getAttackwithTypes($scope.viewType);
				
				}
			};
			
		};
	
	// Attacks Summary 
	
		function getAttackwithTypes(view){
				d3.selectAll(".datamaps-legend").html("");
				//$scope.safeApply();
				$scope.type = view;
				var uri;
				if($scope.d1){
				       uri = rootURL.url.baseURL + "global/attacking-countries?type="+$scope.type+"&from="+$scope.d1+"&to="+$scope.d2;	
				}else{
					uri = rootURL.url.baseURL + "global/attacking-countries?type="+$scope.type;
				}
			
				crudSrv.getResults(uri,function(data, status){
					ngProgress.complete();
					
					getData(data);
					
				}, function(error){
					console.log(error);
			});
		};	

		
		/*
		function getDataSummary (data){
				$scope.mapSum = undefined;
				$scope.mapPluginDataSum = undefined;
				$scope.mapSum = {};
				$scope.mapPluginsSum = undefined;
				 var objs ={};
				$scope.countries = [];
				$scope.countries = [];
				 $scope.obj = undefined;  $scope.obj = {};
		//	console.log(data);
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
			//	console.log("eu"); 
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
		
			
			 objs[data[i].countryCode]  = obj;
			$scope.countries.push(obj);
			 }
		})(i);
		
		
	
		
		//$scope.value =  $scope.obj;
		//console.log($scope.obj);
		d3.selectAll(".datamaps-legend").html("");
		$scope.mapSum = {
		responsive : true,
		scope: 'world',
				  options: {
					 height:500,
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
								//  console.log(geo.properties);
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
		
				$scope.mapPluginsSum = {
					bubbles: null,
					customLegend: function(layer, data, options) {
						d3.selectAll(".datamaps-legend").html("");
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
				$scope.mapPluginDataSum = {
				  bubbles: [{name: 'Bubble 1', latitude: 21.32, longitude: -7.32, radius: 0, fillKey: 'gt500'}]
				};
	  };
			
			*/
			
	$scope.updateActiveGeographySum = function(geography) {
		$scope.stateName = geography.properties.name;
		$scope.stateCode = geography.id;
		console.log($scope.stateName);
		console.log(geography.id);
		//countryClick(geography);
	//$location.path("/CountryIps/" + $scope.stateName);	
	};	
	
});
 

app.controller('InternalThreatCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	
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
			
			$scope.chartArray = [];
			 var admin = 0; var it = 0;
			var sales = {
				"category":"Sales",
				"hits":0
			};
			var admin = {
				"category":"Marketing",
				"hits":0
			};
			
			var it = {
				"category":"IT",
				"hits":0
			};
			
			crudSrv.getResults(rootURL.url.baseURL +"attacks/internal-attacks?page=0&limit="+990,function(data, status){
					ngProgress.complete();
					console.log(data);	 
					$scope.totalCount = data.totalElements;
				     angular.forEach(data.content, function(item, i){
						 if(item.origin.ip == "172.20.16.34"){
							 sales.hits = sales.hits +1;
						 }else if(item.origin.ip == "111.68.99.58"){
							   it.hits = it.hits+1;
						 }else{
							 if(item.origin.ip == "111.68.99.39"){
								 admin.hits = admin.hits+1;
							 }
						 }
					 });
					 
				//console.log(sales, admin, it);
				$scope.chartArray.push(sales);
				$scope.chartArray.push(it);
				$scope.chartArray.push(admin);
				getBar($scope.chartArray);
			});
			
				function getBar(data){
					$scope.pieChartArray = [];
					$scope.categories = [];
					data.forEach(function(elem, i) {
							
						$scope.pieChartArray.push({
							name: elem['category'],
							y: parseInt(elem['hits'])
						});
						$scope.categories.push(elem['category']);
						
					});
					$scope.chartSeries = [{
					name: "Internal Threats",
					colorByPoint: true,
					data: $scope.pieChartArray
					}];
		
				$scope.barConfig = utilityMethods.chartObjs($scope.chartSeries, 'Internal Threats with Respect to Departments', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> {point.y}</span>',false, $scope.categories);
				$scope.barConfig['options']['plotOptions']['column']['events'] = {
				click: function(event) {
					//console.log(event.point);
					if(event.point.stackY != 0){
						$state.go("app.internalThreatDetectedList",{ID:event.point.name});
					}
				
				}	
			};
		};
		
				
			
});	


app.controller('InternalThreatsDetectedListCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	
	// pagination works here for All Attack Lists
		var limit;
		
		$scope.id = $stateParams.ID;
		if($scope.id == "Sales"){
			$scope.ip = "172.20.16.34";
		}else if($scope.id == "IT"){
			$scope.ip = "111.68.99.58";
		}else{
			$scope.ip = "111.68.99.39";
		}
		
		//console.log($scope.id, $scope.ip);
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
					//  console.log(diff);
					  if(diff <= 19){
						  limit = diff;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;  
				  }

				crudSrv.getResults(rootURL.url.baseURL +"attacks/internal-attacks?page="+pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();			 
				 $scope.totalCount = data.totalElements;
				// console.log($scope.totalCount , $scope.pagination.current);
					$scope.data = [];
					$scope.data = data.content;					
			  	$scope.safeApply();
			//	console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
});	

	
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
			   $scope.country.countryCode = $scope.country.countryCode.toLowerCase();
			   $scope.statteCode = $scope.country.countryCode.toUpperCase();
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
			//console.log($scope.center);	
		});
		
		$scope.reload = function(){
			 $state.go("app.CountryIps", {cName:  $scope.country.srcCountry, cCode:$scope.statteCode},{reload:true});
		};
	
		
			$scope.showIp = false;
			$scope.showMap = true;
			ngProgress.start();
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/analysis",function(data, status){
				//console.log(data);
			   $scope.analysis = data;
			   if($scope.analysis.riskFactor >=1 && $scope.analysis.riskFactor <=2.99){
				//   console.log("yellow");
				   $scope.col = "yellow";
			   }else if($scope.analysis.riskFactor >=3 && $scope.analysis.riskFactor <=4.99)
				   {
					    $scope.col = "orange";
						//console.log("orange");
				   }else{
					   if($scope.analysis.riskFactor >=5){
						   $scope.col = "red";
						//	console.log("red");
					   }
				   }
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			
			});	
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/activity-summary",function(data, status){
			//	console.log(data);
			   getBar(data);
			   
			},function(data){
				console.log(data);
			});	
			
			function getBar(data){
				$scope.pieChartArray = [];
			$scope.categories = [];
			data.forEach(function(elem, i) {
						if(elem['category'] == "Total Attacks"){
								$scope.totalHits = elem['hits'];
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
		
		$scope.barConfig = utilityMethods.chartLine($scope.chartSeries, 'Activity Summary', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> {point.y}</span>',false, $scope.categories);
		$scope.barConfig['options']['plotOptions']['area']['events'] = {
				click: function(event) {

					//console.log(event.point);
					if(event.point.stackY != 0){
						var p = getCode(event.point.name);
						var path = "#/app/ip/"+$scope.ipAddress+"/attack/"+p;
						//console.log(path);
						window.open(path);
						//console.log(p);
						//console.log(event);
					}
				
				}	
			};
		};
		
		function getCode(type){
			var attack ;
			if(type == "Web Attacks"){
			  attack = "web";
			}else if(type == "SSH Attacks"){
					attack = "ssh";
			}else if(type == "Database Attacks"){
				attack ="db";
			}else if(type == "Reconnaissance"){
				attack = "probing";
			}else if(type == "Malware Infection"){
				attack="malware";
			}else{
				if(type == "SIP Attacks"){
					attack = "sip";
				}
			}
			return attack;	
		};
		
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/activity-pulse",function(data, status){
			//	console.log(data);
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
						//console.log(date);
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
		$scope.chartConfig['options']['plotOptions']['line']['events'] = {
				click: function(event) {
						//console.log(data);	
						//console.log(event.point);
						if(event.point.y != 0){
							var linked = searchName(event.point.name, event.point.y, data);
						//	console.log(linked);
							getLinkedGraph(linked.attacks);
						}
				},
				mouseOver:function(event){
				//	console.log(event);
					/*
					if(event.point.y != 0){
							var linked = searchName(event.point.name, event.point.y, data);
							console.log(linked);
							getLinkedGraph(linked.attacks);
						}
						*/
				},
				mouseOut:function(event){
					$scope.linkedActivity = false;
				}
			    	
			};
		};
		
		function getLinkedGraph(linkArray){
			//console.log(linkArray);
			$scope.cate = [];
			$scope.chartArray = [];
			linkArray.forEach(function(elem, i){
				//	console.log(elem);
					$scope.chartArray.push({
						name: elem['category'],
						y: parseInt(elem['hits'])
					});
					$scope.cate.push(elem['category']);
			});
			
		//	console.log($scope.cate);
			$scope.chartLink = [{
				name: "Pulse Duration",
				colorByPoint: true,
				data: $scope.chartArray
			}];
			
			//console.log($scope.chartSeries);
			$scope.actConfig = utilityMethods.chartLine($scope.chartLink, 'Pulse Time Duration', '<span style="font-size:10px"></span> <br/><span style="font-size:10px"> {point.y}</span>',false, $scope.cate);
			$scope.linkedActivity = true;
			$scope.safeApply();
			//console.log($scope.linkedActivity);
		};
		
		
		function searchName(xtime,hits, myArray){
		     //  console.log(myArray);  
		for (var i=0; i < myArray.length; i++) {
			if (myArray[i]['x-time'] == xtime && myArray[i]['y-hits'] == hits) {
				return myArray[i];
			}
		}
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
		
		
		// pagination works here for All Attack Lists  
			$scope.pagination = {
					current: 1
			};
				
				$scope.totalPerPage = 20; 
				
			$scope.pageChanged = function(newPage) {
				getResultsPage(newPage);
			};
				
			$scope.viewIPHistory = function(country, ip){
			//	console.log(ip);
				getResultsPage(1);	
			};
			
			$scope.deleteModal = false;
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
		
		
		function getType (service , ob){
			var type ;
			if(service == "ssh"){
				if(ob.hasOwnProperty('downloads')){
					type = "malware";
				}else{
					type = "ssh";
				}
			}else if(service == "smb" || service == "microsoft-ds" ){
				    if(ob.hasOwnProperty('download')){
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
		
		
			$scope.showModal = function(item) {
			$scope.modalType = utilityMethods.getType(item.service, item);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.srcIP + "&dstPort=" +item.dstPort+"&dateTime="+item.dateTime, function(data, status) {
				$scope.network = data;
				//console.log(data);
				ngProgress.complete();
				$scope.deleteModal = true;
				$scope.value = item;
			//	console.log(item);
			}, function(error) {
				$scope.deleteModal = true;
				$scope.value = item;
				console.log(error);
			});
			
			
		};

		$scope.showModalHide = function() {
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
		};
		
			
			
			function getResultsPage(pageNum) {
				  pageNum = pageNum -1;
				 
				  if( pageNum >= 1){
					  var diff = $scope.totalCount -(pageNum * 20);
				//	  console.log(diff);
					  if(diff <= 19){
						  limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;
					  
				  }

			 crudSrv.getResults(rootURL.url.baseURL+"ip/"+$scope.ipAddress+"/history?page="+pageNum+"&limit="+limit ,function(data, status){
				ngProgress.complete();
				
				 $scope.totalCount = data.totalElements;
				// console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
				$scope.showIp = true;
				$scope.showMap = false;
			 
			  	$scope.safeApply();
				//console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
			
		
			$scope.viewMap = function(){
				$scope.showIp = false;
				$scope.showMap = true;
			};
		
       }]);

app.controller('ActivitySummaryCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster) {
	// pagination works here for All Attack Lists
	$scope.deleteModal = false;
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
		
		
		function getType (service , ob){
			var type ;
			if(service == "ssh"){
				if(ob.hasOwnProperty('downloads')){
					type = "malware";
				}else{
					type = "ssh";
				}
			}else if(service == "smb" || service == "microsoft-ds" ){
				    if(ob.hasOwnProperty('download')){
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
		
		
		 $scope.getHash = function(hash){
		console.log(hash); 

	crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/cuckoo-analysis?hash="+hash, function(data, status) {	
		console.log(data);
          if(data){
			  console.log("exist");
		  }else{
			  alert("cukko data does not exist");
		  }		
	  });
	  };
		
		
			$scope.showModal = function(item) {
				console.log(item);
			$scope.modalType = utilityMethods.getType(item.service, item);
			console.log($scope.modalType);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.srcIP + "&dstPort=" +item.dstPort+"&dateTime="+item.dateTime, function(data, status) {
				$scope.network = data;
				console.log(data);
				ngProgress.complete();
				$scope.deleteModal = true;
				$scope.value = item;
				$scope.safeApply();
				console.log(item);
			}, function(error) {
				$scope.deleteModal = true;
				$scope.modalType = utilityMethods.getType(item.service, item);
				$scope.value = item;
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+item.origin.ip+"/analysis",function(data, status){
				console.log(data);
			   $scope.analysis = data;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			});
		};

		$scope.showModalHide = function() {
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
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
					//  console.log(diff);
					  if(diff <= 19){
						  limit = 20;
					  }else{
						  limit = 20;
					  }
				  }else{
					  limit = 20;  
				  }

			 crudSrv.getResults(rootURL.url.baseURL+"ip/"+$stateParams.ip+"/history?page="+pageNum+"&limit="+limit+"&type="+$stateParams.attack ,function(data, status){
				ngProgress.complete();			 
				 $scope.totalCount = data.totalElements;
				// console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
			  	$scope.safeApply();
				//console.log(data);
				}, function(error){
				console.log(error);
				});
			};		
});		   
	   
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
app.controller('MainReportCtrl', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state, ngToast, toaster, $window , $sce , $filter) {
	$scope.date = {};
	var jsonConfig = {

		'Content-Type': 'application/json',
		'Accept': 'application/pdf'
	};

	$scope.isLoading = false;
	$scope.loaderHide = false;
	//console.log(jsonConfig);
	var resultObject;
	$scope.d_one_error = {
		today: false,
		date_two: false
	};
	$scope.d_two_error = {
		today: false,
		date_one: false
	};
	$scope.onD1Set = function(newDate, oldDate) {
		//console.log(newDate);
		var d = new Date();
		if (newDate >= d) {
			$scope.d_one_error.today = true;
		} else {
			$scope.d_one_error.today = false;
			if ($scope.date.endDate != undefined) {
				if (newDate >= $scope.date.endDate) {
					$scope.d_one_error.date_two = true;
				} else {
					$scope.d_one_error.date_two = false;
				}
			}

		}
	};

	$scope.onD2Set = function(newDate, oldDate) {
		//console.log(newDate);
		var d = new Date();
		if (newDate >= d) {
			$scope.d_two_error.today = true;
		} else {
			$scope.d_two_error.today = false;
			if ($scope.date.startDate != undefined) {
				if (newDate <= $scope.date.startDate) {
					$scope.d_two_error.date_one = true;
				} else {
					$scope.d_two_error.date_one = false;
					$scope.d_one_error.date_two = false;
				}
			}

		}
	};

	$scope.searchDate = function() {
		var d = new Date($scope.date.startDate);
		var a = $filter('date')($scope.date.startDate, "yyyy-MM-dd HH:mm:ss");
		var d1 = utilityMethods.addTInDateTime(a);
		//console.log(d1, $scope.date.startDate);
		var dd = new Date($scope.date.endDate);
		var a2 = $filter('date')($scope.date.endDate, "yyyy-MM-dd HH:mm:ss");
		var d2 = utilityMethods.addTInDateTime(a2);
		var ob = $scope.selection.reduce(function(result, currentObject) {
			for (var key in currentObject) {
				if (currentObject.hasOwnProperty(key)) {
					result[key] = currentObject[key];
				}
			}
			return result;
		}, {});

		$scope.request = false;
	
		createPostRequest(ob, "http://115.186.132.18:8080/BirtReporting/report?from=" + d1 + "&to=" + d2);
	};


	$scope.heading = "PDF Report";
	$scope.selection = [];
	$scope.ob = true;
	$scope.obj = {};
	$scope.request = true;
	// toggle selection for a given employee by name
	$scope.toggleSelection = function toggleSelection(employeeName) {
		$scope.ob = true;
	//	console.log($scope.ob);
		for (name in employeeName.val) {
			$scope.obj.nam = name;
		//	console.log($scope.obj.nam);
		};

		// console.log($scope.obj);
		//console.log($scope.selection.length);
		if ($scope.selection.length == 0) {
			// var ob = {"employeeName":true};
			$scope.selection.push(employeeName.val);
		//	console.log(employeeName.val);
		//	console.log($scope.selection);
		} else {
			var nam;
			for (var i = 0, len = $scope.selection.length; i < len; i++) {
				for (names in $scope.selection[i]) {
				//	console.log(names);
				//	console.log(nam);
					if (names == $scope.obj.nam) {
						$scope.ob = false;
						$scope.selection.splice(i, 1);
					//	console.log("match");
					}
				}
			}

		//	console.log($scope.ob);
			
			if ($scope.ob == true) {
			//	console.log($scope.selection.length);
				$scope.selection.push(employeeName.val);
			//	console.log($scope.selection);
			}
		}
	};

	
	
	
	// probing
	
	$scope.checkProbingAll = function(val){
		$scope.isProbingSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isProbingSelected = true;
		});
	};
	
	$scope.showAllProbing = function () {
	//	console.log($scope.probingAll);
        if ($scope.probingAll) {
            $scope.probingAll = true;
        } else {
            $scope.probingAll = false;
        }
        angular.forEach($scope.probing, function (item) {
          //  console.log(item);
			item.Selected = $scope.probingAll;
        });

    };
	
	$scope.probing = [{
		name: 'Probed Countries',
		val: {
			"probedCountries": true
		}
	}, {
		name: 'Probed Countries Unique IP',
		val: {
			"probedCountriesUniqueIPs": true
		}
	}, {
		name: 'Probed IP',
		val: {
			"probedIPs": true
		}
	}];

	
	// Malware
	
	$scope.checkMalwareAll = function(val){
		$scope.isMalwareSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isMalwareSelected = true;
		});
	};
	
	
	$scope.showAllMalware = function () {
		//console.log($scope.malwareAll);
        if ($scope.malwareAll) {
            $scope.malwareAll = true;
        } else {
            $scope.malwareAll = false;
        }
        angular.forEach($scope.malware, function (item) {
          //  console.log(item);
			item.Selected = $scope.malwareAll;
        });

    };
	
	
	$scope.malware = [{
		name: 'Malware Countries',
		val: {
			"malwareCountries": true
		}
	}, {
		name: 'Malware IP',
		val: {
			"malwareIPs": true
		}
	}, {
		name: 'Malware IP 10',
		val: {
			"malwareIPs10": true
		},
	}, {
		name: 'Detected Malwares',
		val: {
			"detectedMalware": true
		}
	}, {
		name: 'Detected Malware Hashes',
		val: {
			"detectedMalwareHashes": true
		}
	}, {
		name: 'Cnc IP',
		val: {
			"cncIPs": true
		}
	}, {
		name: 'Cnc Domains',
		val: {
			"cncDomains": true
		}
	}];

	//
	// sip
	
	$scope.checkSipAll = function(val){
		$scope.isSipSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isSipSelected = true;
		});
	};
	
	
	$scope.showAllSip = function () {
		//console.log($scope.sipAll);
        if ($scope.sipAll) {
            $scope.sipAll = true;
        } else {
            $scope.sipAll = false;
        }
        angular.forEach($scope.sip, function (item) {
          //  console.log(item);
			item.Selected = $scope.sipAll;
        });

    };
	
	$scope.sip = [{
		name: 'SIP Countries',
		val: {
			"sipCountries": true
		}
	}, {
		name: 'SIP Attacks',
		val: {
			"sipAttacks": true
		}
	}, {
		name: 'SIP Registrar IP',
		val: {
			"sipRegistrarIPs": true
		}
	}, {
		name: 'SIP Option IP',
		val: {
			"sipOptionIPs": true
		}
	}, {
		name: 'SIP Proxy IP',
		val: {
			"sipProxyIPs": true
		}
	}, {
		name: 'SIP Tools',
		val: {
			"sipTools": true
		}
	}];

	
	// Web

	
	$scope.checkWebAll = function(val){
		$scope.isWebSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isWebSelected = true;
		});
	};
	
	$scope.showAllWeb = function () {
		//console.log($scope.webAll);
        if ($scope.webAll) {
            $scope.webAll = true;
        } else {
            $scope.webAll = false;
        }
        angular.forEach($scope.web, function (item) {
          //  console.log(item);
			item.Selected = $scope.webAll;
        });

    };
	
	$scope.web = [{
		name: 'Web Countries',
		val: {
			"webCountries": true
		}
	}, {
		name: 'Web IP',
		val: {
			"webIPs": true
		}
	}, {
		name: 'Web Severities',
		val: {
			"webSeverities": true
		}
	}, {
		name: 'Web Attacks',
		val: {
			"webAttacks": true
		}
	}];

	
	// Brute Force
	
	$scope.checkBruteAll = function(val){
		$scope.isBruteSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isBruteSelected = true;
		});
	};
	
	$scope.showAllBrute = function () {
		//console.log($scope.bruteAll);
        if ($scope.bruteAll) {
            $scope.bruteAll = true;
        } else {
            $scope.bruteAll = false;
        }
        angular.forEach($scope.brute, function (item) {
         //   console.log(item);
			item.Selected = $scope.bruteAll;
        });

    };
	
	$scope.brute = [{
		name: 'SSH Countries',
		val: {
			"sshCountries": true
		}
	}, {
		name: 'SSH IP',
		val: {
			"sshIPs": true
		}
	}, {
		name: 'SSH Username',
		val: {
			"sshUsernames": true
		}
	}, {
		name: 'SSH Password',
		val: {
			"sshPasswords": true
		}
	}, {
		name: 'SSH Tools',
		val: {
			"sshTools": true
		}
	}];


	// Global

	
	$scope.checkGlobalAll = function(val){
		$scope.isGlobalSelected = false; 
		val.forEach(function(item){
			if(item.Selected)
				$scope.isGlobalSelected = true;
		});
	};
	
	$scope.showAllGlobal = function () {
		//console.log($scope.globalAll);
        if ($scope.globalAll) {
            $scope.globalAll = true;
        } else {
            $scope.globalAll = false;
        }
        angular.forEach($scope.global, function (item) {
          //  console.log(item);
			item.Selected = $scope.globalAll;
        });

    };
	
	$scope.global = [
	{
		name: 'Global Countries',
		val: {
			"globalCountries": true
		}
	},
	{
		name: 'Top 3 Global Attacking Countries',
		val: {
			"globalAttacks3": true
		}
	}, {
		name: 'Attacked OS',
		val: {
			"attackedOSs": true
		}
	}, {
		name: 'Vulnerabilities',
		val: {
			"vulnerabilities": true
		}
	}, {
		name: 'Attacked Protocols',
		val: {
			"attackedProtocols": true
		}
	}];

	moment.locale('en');
	
	

	
	
	$scope.produceReport = function() {
		//console.log($scope.options);
		angular.forEach($scope.malware, function (item) {
           if(item.Selected){
			  // console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		angular.forEach($scope.probing, function (item) {
           if(item.Selected){
			 //  console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		angular.forEach($scope.sip, function (item) {
           if(item.Selected){
			 //  console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		angular.forEach($scope.web, function (item) {
           if(item.Selected){
			 //  console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		
		angular.forEach($scope.brute, function (item) {
           if(item.Selected){
			//   console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		
		angular.forEach($scope.global, function (item) {
           if(item.Selected){
			//   console.log(item.val);
			   $scope.selection.push(item.val);
		   }
		});
		
		resultObject = $scope.selection.reduce(function(result, currentObject) {
			for (var key in currentObject) {
				if (currentObject.hasOwnProperty(key)) {
					result[key] = currentObject[key];
				}
			}
			return result;
		}, {});

		//console.log(resultObject);
		
		
		$scope.request = false;
		$scope.toaster = {
			type: 'wait',
			title: 'PDF Report',
			text: 'Please Wait for a Minute'
		};
		$scope.isLoading = true;
		//console.log($scope.date);
			if($scope.date != null && $scope.date != undefined){
				if($scope.date.startDate != undefined && $scope.date.endDate){
					var d = new Date($scope.date.startDate);
					var a = $filter('date')($scope.date.startDate, "yyyy-MM-dd HH:mm:ss");
					var d1 = utilityMethods.addTInDateTime(a);
					//console.log(d1, $scope.date.startDate);
					var dd = new Date($scope.date.endDate);
					var a2 = $filter('date')($scope.date.endDate, "yyyy-MM-dd HH:mm:ss");
					var d2 = utilityMethods.addTInDateTime(a2);
					createPostRequest(resultObject, "http://115.186.132.18:8080/BirtReporting/report?from=" + d1 + "&to=" + d2);
				}else{
					createPostRequest(resultObject, "http://115.186.132.18:8080/BirtReporting/report");
				}
			}else{
				createPostRequest(resultObject, "http://115.186.132.18:8080/BirtReporting/report");
			}
				
	};

	function createPostRequest(data, url) {
	//	console.log(jsonConfig);
			$scope.toaster = {
			type: 'wait',
			title: 'PDF Report',
			text: 'Please Wait for a Minute'
		};
		toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text, 10000);
		$scope.loaderHide = true;
		crudSrv.createRequest(url, data, jsonConfig, function(data, status) {
			ngProgress.complete();
			$scope.request = true;
			$scope.selection = undefined;
			$scope.selection = [];
			
			var file = new Blob([data], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(file);
            window.open(fileURL);
			$scope.loaderHide = false;
            var link=document.createElement('a');
	        link.href=fileURL;
	     //   console.log(link.href);
	        link.download="TI-report.pdf";
	        link.click();
			$scope.isLoading = false;
			/*
			var blob = new Blob([data], {type: "application/pdf"}); 
			var fileURL = URL.createObjectURL(blob);
			$scope.pdfContent = $sce.trustAsHtml(data);
			*/

			// console.log(data);	 
			/*	var zip = new Blob([data], {
                         type: 'application/pdf' //or whatever you need, should match the 'accept headers' above
                     });
          
		 
			console.log(blob);
		window.saveAs(blob, "ss.pdf");
		*/

			//var raw = window.atob(data);
			//window.open("data:application/pdf;base64, " + raw);
			//	window.open("data:application/pdf;base64, " + data);
			//	var objectUrl = URL.createObjectURL(blob);
			//	window.open(objectUrl);


		}, function(error) {
			$scope.request = true;
			$scope.isLoading = false;
		});
	};

			
});

app.controller('DashBoardAttackInfo', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state, $filter) {
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
			console.log(item);
			$scope.modalType = $scope.type;
			crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.srcIP + "&dstPort=" +item.dstPort+"&dateTime="+item.dateTime, function(data, status) {
				$scope.network = data;
				console.log(data);
				ngProgress.complete();
				$scope.deleteModal = true;
				$scope.value = item;
				console.log(item);
			}, function(error) {
				$scope.deleteModal = true;
				$scope.value = item;
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+ item.origin.ip + "/analysis",function(datas, status){
				console.log(datas);
			   $scope.analysis = datas;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			});
			
		};

		
	  $scope.getHash = function(hash){
		console.log(hash); 

	crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/cuckoo-analysis?hash="+hash, function(data, status) {	
		console.log(data);
          if(data){
			  console.log("exist");
		  }else{
			  alert("cukko data does not exist");
		  }		
	  });
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
			
			crudSrv.getResults(rootURL.url.baseURL + "attacks/" + $scope.types + "/history?page=" + pageNumber + "&limit=" + $scope.counts, function(data, status) {
				$scope.data = data.content;
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
				//console.log(diff);
				if (diff <= 19) {
					limit = 20;
				} else {
					limit = 20;
				}
			} else {
				limit = 20;

			}

			crudSrv.getResults(rootURL.url.baseURL + "attacks/" + $scope.types + "/history?page=" + pageNum + "&limit=" + limit, function(data, status) {
				ngProgress.complete();
				$scope.totalCount = $scope.counts;
				//console.log($scope.totalCount, $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
				$scope.safeApply();
			//	console.log(data);
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

	
});

app.controller('FreeSearchCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state, $filter) {
		$scope.deleteModal = false;
		$scope.q = $stateParams.q;

		$scope.showModal = function(item) {
			$scope.modalType =utilityMethods.getType(item.service, item);
			console.log($scope.modalType);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.origin.ip + "&dstPort=" +item.dstPort+"&dateTime="+item.dateTime, function(data, status) {
				$scope.network = data;
				console.log(data);
				ngProgress.complete();
				$scope.deleteModal = true;
				$scope.value = item;
				$scope.safeApply();
				console.log(item);
			}, function(error) {
				$scope.deleteModal = true;
				$scope.modalType = utilityMethods.getType(item.service, item);
				$scope.value = item;
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+item.origin.ip+"/analysis",function(data, status){
				console.log(data);
			   $scope.analysis = data;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			});	
		};

		
	  $scope.getHash = function(hash){
		console.log(hash); 
		crudSrv.getResults(rootURL.url.baseURL + "attacks/malware/cuckoo-analysis?hash="+hash, function(data, status) {	
			console.log(data);
			  if(data){
				  console.log("exist");
			  }else{
				  alert("cukko data does not exist");
			  }		
		  });
	  };
		$scope.showModalHide = function() {
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
		};
		
		
		$scope.data = [];
		$scope.pageChanged = function(newPage) {
			getResultsPage(newPage);
		};
		
		getResultsPage(1);
		
		function getResultsPage(pageNum) {
			pageNum = pageNum - 1;
			if (pageNum >= 1) {
				var diff = $scope.counts - (pageNum * 20);
				//console.log(diff);
				if (diff <= 39) {
					limit = 40;
				} else {
					limit = 40;
				}
			} else {
				limit = 40;
			}
			

			crudSrv.getResults(rootURL.url.baseURL+"search?q="+$scope.q,function(data, status){
				console.log(data);	
				ngProgress.complete();
				$scope.totalPerPage = " ";
				 $scope.totalCount = " ";
				$scope.totalPerPage = data.size;
				 $scope.totalCount = data.totalElements;
				//console.log($scope.totalCount, $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
				if($scope.data.length >=1){
					$scope.type = "";
				}else{
					$scope.type = "no";
				}
				$scope.safeApply();
			//	console.log(data);
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

	
});

app.controller('TestDashBoard', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods, rootURL,$state) {
	
});


app.controller('advancedSearchCTRL', function($scope, $rootScope, $stateParams, $location, $http, $timeout, ngProgress, crudSrv, utilityMethods,rootURL, $state, $filter, toaster, $timeout) {
	$scope.data = [];
	var jsonConfig = {
		'Content-Type': 'application/json',
	};
	$scope.shown = true;
	$scope.showUpdateField = false;
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
	
	$scope.deleteModal = false;
		var limit;
		function getType (service , ob){
			var type ;
			if(service == "ssh"){
				if(ob.hasOwnProperty('downloads')){
					type = "malware";
				}else{
					type = "ssh";
				}
			}else if(service == "smb" || service == "microsoft-ds" ){
				    if(ob.hasOwnProperty('download')){
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
	
	$scope.date = {};
	$scope.d_one_error = { today: false, date_two :false };
	$scope.d_two_error = { today: false , date_one : false};
		$scope.onD1Set = function (newDate,oldDate) {
			//console.log(newDate);		
			var d = new Date();
			if(newDate >= d){
			  $scope.d_one_error.today = true;
			}else
			{
				$scope.d_one_error.today = false;
				if($scope.demo.endDate != undefined){
					if(newDate >= $scope.demo.endDate){
						 $scope.d_one_error.date_two = true;
					}else{
						 $scope.d_one_error.date_two = false;
					}
				}	
			}	
		};
	
		$scope.onD2Set = function (newDate,oldDate) {
			//console.log(newDate);		
			var d = new Date();
			if(newDate >= d){
			  $scope.d_two_error.today = true;
			}else
			{
				$scope.d_two_error.today = false;
				if($scope.demo.startDate != undefined){
					if(newDate <= $scope.demo.startDate){
						 $scope.d_two_error.date_one = true;
					}else{
						$scope.d_two_error.date_one = false;
						$scope.d_one_error.date_two =false ;
					}
				}
			}	
		};
	
		
		$scope.showModal = function(item) {
			$scope.modalType =utilityMethods.getType(item.service, item);
			console.log($scope.modalType);
			crudSrv.getResults(rootURL.url.baseURL + "attacks/network-detail?srcIP=" + item.origin.ip + "&dstPort=" +item.dstPort+"&dateTime="+item.dateTime, function(data, status) {
				$scope.network = data;
				console.log(data);
				ngProgress.complete();
				$scope.deleteModal = true;
				$scope.value = item;
				$scope.safeApply();
				console.log(item);
			}, function(error) {
				$scope.deleteModal = true;
				$scope.modalType = utilityMethods.getType(item.service, item);
				$scope.value = item;
				console.log(error);
			});
			
			crudSrv.getResults(rootURL.url.baseURL+"ip/"+item.origin.ip+"/analysis",function(data, status){
				console.log(data);
			   $scope.analysis = data;
			   $scope.analysis.riskFactor = parseFloat($scope.analysis.riskFactor).toFixed(2);
					 $scope.analysis.firstSeen= $filter('date')($scope.analysis.firstSeen ,"yyyy-MM-dd hh:mm:ssa", "UTC");
					 var date = $scope.analysis.lastSeen;
					    var d = new Date(date);
						$scope.analysis.lastSeen = $filter('date')(d,"yyyy-MM-dd hh:mm:ssa", "UTC");
			});	
		};

		$scope.showModalHide = function() {
			$scope.deleteModal = false;
			$scope.value = undefined;
			$scope.modalType = undefined;
		};
		
		crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries",function(data, status){
			ngProgress.complete();
			console.log(data);
			$scope.countries = data;
		});				
	
		crudSrv.getResults(rootURL.url.baseURL+"search/fetch",function(data, status){
			console.log(data);
			$scope.savedSearched = [];
			$scope.savedSearched = data.content;
		});	
	
		var allObj = utilityMethods.getJson();
		$scope.attacks = allObj.attacks;
		$scope.ports = allObj.ports;
		$scope.sensors = allObj.sensors;
		$scope.countries = allObj.countries;
		console.log(allObj);
		$scope.demo = {};
		$scope.demo['attackes'] = [];
		$scope.demo['services'] = [];
		
		$scope.demo['prt'] = [];
		$scope.demo['ports'] = [];
		
		$scope.demo['sensor'] = [];
		$scope.demo['sensors'] = [];
		
		
		$scope.demo['ip'] = [];
		$scope.threatform = {};
		$scope.user = {};
		$scope.person = {};
		
		$scope.demo['code'] = [];
		$scope.demo['ip'] = [];
		$scope.demo['sensors'] = [];
		$scope.demo['services'] = [];
		$scope.demo['ports'] = [];
		$scope.notify = false;	
		
		function demoInitilization(){
			//console.log(demo);
			$scope.demo['code'] = [];
			$scope.demo['ip'] = [];
			$scope.demo['sensors'] = [];
			$scope.demo['services'] = [];
			$scope.demo['ports'] = [];
			
			if($scope.demo.cc){
				$scope.demo.cc.forEach(function(item){$scope.demo['code'].push(item.countryCode)});
			}
			if($scope.demo.tags){
				$scope.demo.tags.forEach(function(item){$scope.demo['ip'].push(item.text)});
			}
			if($scope.demo.prt){
				$scope.demo.prt.forEach(function(item){$scope.demo['ports'].push(item)});
			}
			if($scope.demo.attackes){
				$scope.demo.attackes.forEach(function(item){$scope.demo['services'].push(item)});
			}
			if($scope.demo.sensor){
				$scope.demo.sensor.forEach(function(item){$scope.demo['sensors'].push(item)});
			}
			
			if($scope.demo.startDate != undefined && $scope.demo.endDate != undefined){
				$scope.demo.startDate = $filter('date')($scope.demo.startDate ,"yyyy-MM-dd HH:mm:ss");
				$scope.demo.startDate = utilityMethods.addTInDateTime($scope.demo.startDate);
		//	console.log(d1, $scope.date.startDate);
			
			$scope.demo.endDate = $filter('date')($scope.demo.endDate ,"yyyy-MM-dd HH:mm:ss");
			$scope.demo.endDate = utilityMethods.addTInDateTime($scope.demo.endDate);
			}

			console.log($scope.demo.cc);
		};
		
	
	$scope.search = function(demo){
		demoInitilization();
		getResultsPage(1);
	
	};
  
		$scope.pagination = {
			current: 1
		};
		
		$scope.pageChanged = function(newPage) {
			getResultsPage(newPage);
		};
		
		function getResultsPage(pageNum) {
			pageNum = pageNum - 1;
			if (pageNum >= 1) {
				var diff = $scope.counts - (pageNum * 20);
				//console.log(diff);
				if (diff <= 39) {
					limit = 40;
				} else {
					limit = 40;
				}
			} else {
				limit = 40;
			}
			
			if(!$scope.shown){
				var search = $scope.shownSaveSearch ;
			}else{
				console.log("in");
				var search = "type="+$scope.demo.services+"&prt="+$scope.demo['ports']+"&cc="+$scope.demo['code']+"&ip="+$scope.demo.ip+"&dst="+$scope.demo.sensors+"&from="+$scope.demo.startDate+"&to="+$scope.demo.endDate+"&page="+pageNum+"&limit="+limit;
			}
			
			console.log(search);
			crudSrv.getResults(rootURL.url.baseURL+"search?"+search,function(data, status){
				$scope.uri = rootURL.url.baseURL+"search?"+search;
				console.log(data);	
				ngProgress.complete();
				$scope.totalPerPage = " ";
				 $scope.totalCount = " ";
				$scope.totalPerPage = data.size;
				 $scope.totalCount = data.totalElements;
				 $scope.searcher = true;
				//console.log($scope.totalCount, $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.content;
				if($scope.data.length >=1){
					$scope.type = "";
				}else{
					$scope.type = "no";
				}
				$scope.safeApply();
			//	console.log(data);
			}, function(error) {
				console.log(error);
			});
		};
		
		$scope.collap = true;
		$scope.showCollapse = function(collapse){
			$scope.collap = ! $scope.collap;
		};
		
		$scope.changeView = function (view,index){
		$scope.ind = index;
		console.log(typeof $scope.ind);
		$scope.showType = view;
		}
		
		/*
		 *  Seacrh Query and Save search Lists delete etc
		*/
		
		$scope.checkQuery = function(query){
			console.log(query.Selected, query, query.selected);
			if(query){
				$scope.queryshow = true;
			}else{
				$scope.queryshow = false;
			}
		};
	
		$scope.showSearches = function(){
			$scope.shown = !$scope.shown;
			if($scope.shown){
				$scope.showUpdateField = false;
				crudSrv.getResults(rootURL.url.baseURL+"search/fetch",function(data, status){
				console.log(data);
				$scope.savedSearched = [];
				$scope.savedSearched = data.content;
				});	
			}
		}
	
		$scope.getQuery = function(queryData){
		   console.log(queryData);
		   var split = $scope.uri.split("?");
	       console.log($scope.notify);
		   console.log(split[1]);
		   var object ={
			   query:split[1],
			   queryName:queryData,
			   notify:$scope.notify
			   };
			
			crudSrv.getResults(rootURL.url.baseURL + "search/exists?name="+queryData,function(dat, status){
				console.log(typeof dat.exists);
				
				if(dat.exists === "true"){
					alert("This name is already exists");
				}else{
						crudSrv.createRequest(rootURL.url.baseURL + "search/save",object,jsonConfig,function(datas, status){
							console.log(datas);
							$scope.searcher = false;
							$scope.queryshow = false;
							$scope.toaster = {
								type: 'wait',
								title: 'query',
								text: 'Query has been Saved'
							};
							toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text, 1000);
								crudSrv.getResults(rootURL.url.baseURL+"search/fetch",function(data, status){
									console.log(data);
									$scope.savedSearched = [];
									$scope.savedSearched = data.content;
								},function(error){});
						},function(error){
								console.log("error");
						}); 
					}
			});			
				   
		};
		
		$scope.deleteSearch = function(del){
			//alert(del);
			crudSrv.deleteResults(rootURL.url.baseURL+"search/delete?name="+del.queryName,function(datas, status){
				crudSrv.getResults(rootURL.url.baseURL+"search/fetch",function(data, status){
					console.log(data);
					$scope.savedSearched = [];
					$scope.savedSearched = data.content;
				},function(error){});	
			
				},function(error){
					console.log("error");
			});	
		};
		
		$scope.updateSaveQuery = function(queryData){
			demoInitilization();	
			var search = "type="+$scope.demo.services+"&prt="+$scope.demo['ports']+"&cc="+$scope.demo['code']+"&ip="+$scope.demo.ip+"&dst="+$scope.demo.sensors+"&from="+$scope.demo.startDate+"&to="+$scope.demo.endDate+"&page="+0+"&limit="+20;
			//var split = $scope.uri.split("?");
			console.log($scope.notify);
			//console.log(split[1]);
		   var object ={
			   query:search,
			   queryName:queryData,
			   notify:$scope.notify
			   };
			
				crudSrv.createRequest(rootURL.url.baseURL + "search/update/"+$scope.prevName,object,jsonConfig,function(datas, status){
					console.log(datas);
					$scope.searcher = false;
					$scope.queryshow = false;
					$scope.toaster = {
						type: 'wait',
						title: 'query',
						text: 'Query has been Updated'
					};
					toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text, 1000);
						crudSrv.getResults(rootURL.url.baseURL+"search/fetch",function(data, status){
							console.log(data);
							$scope.savedSearched = [];
							$scope.savedSearched = data.content;
							$scope.query = false;
							$scope.shown = false;
							$scope.queryshow = false;
							$scope.showUpdateField = false;
							$scope.queryText = ""; 
							$scope.demo = {};
							
						},function(error){});
				},function(error){
						console.log("error");
				}); 		
		};
		
		
		$scope.updateSearch = function(val){
			$scope.demo = [];
			console.log(val.query);
			$scope.prevName = val.queryName;
			$scope.queryText = val.queryName;
			var split = val.query.split('&');
			console.log(split.length);
			split.forEach(function(val,i){
				//console.log(val,i);
				var object = val.split('=');
				if(object[0] === "type"){
					if(object[1] !=='' && object[1] != null){
						var typ =object[1]; 
							addUpdateType(typ);
					}
				}else if(object[0] === "prt"){
					if(object[1] !=='' && object[1] != null){
						console.log("prt");
						var prt = object[1];
						addUpdatePort(prt);
					}
				}else if(object[0] === "dst"){
					if(object[1] !=='' && object[1] != null){
						console.log("dst");
						var dst = object[1];
						addUpdateSensor(dst);
					}
				}else if(object[0] === "ip"){
					if(object[1] !=='' && object[1] != null){
						console.log("ip");
						var ips = object[1];
						addUpdateIP(ips);
					}
				}else if(object[0] === "cc"){
					if(object[1] !=='' && object[1] != null){
						console.log("cc");
						var c = object[1];
						addUpdateCountry(c);
					}
				}else if(object[0] === "to"){
					if(object[1] !=='' && object[1] != null){
						console.log("to");
						var c = object[1];
						addUpdateEndDate(c);
					}
				}else if(object[0] === "from"){
					if(object[1] !=='' && object[1] != null){
						console.log("from");
							var c = object[1];
						addUpdateStartDate(c);
						
					}
				}
			
			});
			
			$scope.query = true;
			$scope.shown = true;
			$scope.queryshow = true;
			$scope.showUpdateField = true;
			console.log($scope.demo);	
		};
		
		
		$scope.showResultOfSaveQuery = function(val){
				console.log(val);
				$scope.shownSaveSearch	= val.query;
				getResultsPage(1);	
		};
		
		///////////////////////////////////  Function of Value in array ///////////////////////////////////////
		function addUpdateType(types){
			$scope.demo['attackes'] = [];
			types = types.split(',');
			for(var i=0; i<types.length; i++){
				var vl = types[i];
				$scope.demo['attackes'].push(vl);
				console.log($scope.demo);				
			}		
		};
		
		function addUpdatePort(prts){
			prts = prts.split(',');
			$scope.demo['prt'] = [];
			for(var i=0; i<prts.length; i++){
				$scope.demo['prt'].push(prts[i]);
			}	
		};
		
		function addUpdateCountry(ctc){
			ctc = ctc.split(',');
			$scope.demo['cc'] = [];
			for(var i=0; i<ctc.length; i++){
					var c = _.filter($scope.countries, function(num){
							return num['countryCode'] === ctc[i]; });
				console.log(c);			
				$scope.demo['cc'].push(c[0]);				
			}				
		};
		
		function addUpdateSensor(dsts){
			dsts = dsts.split(',');
			console.log(dsts);
			$scope.demo['sensor'] = [];
			for(var d=0; d<dsts.length; d++){
				console.log(dsts[d]);
				$scope.demo['sensor'].push(dsts[d]);					
			}				
		};
		
		function addUpdateIP(ips){
			ips = ips.split(',');
			$scope.demo['tags'] = [];
			for(i=0; i<ips.length; i++){
				$scope.demo['tags'].push({text:ips[i]});
			}				
		};
		
		function addUpdateStartDate(date){
			if(date === "undefined"){
				console.log("und");
			}else{
					$scope.demo.startDate = date;
			}				
		};
		
		function addUpdateEndDate(date){
			if(date === "undefined"){
				console.log("und2");
			}else{
				$scope.demo.endDate = date;
			}				
		};
		
		///////////////////////////////////////////////  End ///////////////////
		/*
		Context Search 
		*/
		 $scope.otherMenuOptions = [
            ['Add into Search', function ($itemScope, $event, color) {
                 if($scope.demo['tags'] != undefined){
					  if($scope.demo['tags'].length >= 1){
					
						var check = _.filter($scope.demo['tags'], function(num){
								console.log(num);
								return num['text'] === color; });
						//console.log(check);		
						if(check.length == 0){
							$scope.demo['tags'].push({text:color});
						}else{
							//alert("match");
						}
					  }else { $scope.demo['tags'] = [];
							  $scope.demo['tags'].push({text:color});
							}					
				}else{
					
					$scope.demo['tags'] = [];
					$scope.demo['tags'].push(color);
				
				}
            }]
        ];
  
		
		/*
		Context Search 
		*/
		 $scope.otherSensorOptions = [
            ['Add into Search', function ($itemScope, $event, port) {
              
				if($scope.demo['sensor'].length >= 1){
					 var check= _.contains($scope.demo['sensor'], port);
					if(!check){
						$scope.demo['sensor'].push(port);
					}else{
						//alert("match");
					}	
				}else{
					$scope.demo['sensor'].push(port);
					
				}
				
            }]
        ];
  

		/*
			Dst Port 
		*/
		 $scope.otherPortOptions = [
            ['Add into Search', function ($itemScope, $event, port) {
                
				if($scope.demo['prt'].length >= 1){
					 var check= _.contains($scope.demo['prt'], port);
					if(!check){
						$scope.demo['prt'].push(port);
					}else{
						//alert("match");
					}	
				}else{
					$scope.demo['prt'].push(port);
				}
				
            }]
        ];
		
		/*
			 country 
		*/
		 $scope.otherCountryOptions = [
            ['Add into Search', function ($itemScope, $event, country) {
                  if($scope.demo['cc'] != undefined){
					  if($scope.demo['cc'].length >= 1){
						console.log(country);
						var check = _.filter($scope.demo['cc'], function(num){
								console.log(num);
								return num['countryCode'] === country.countryCode; });
						//console.log(check);		
						if(check.length == 0){
							$scope.demo['cc'].push(country);
						}else{
							//alert("match");
						}
					  }else { $scope.demo['cc'] = [];
							  $scope.demo['cc'].push(country);
							}					
				}else{
					/*
					var cc = _.filter($scope.countries, function(num){
							return num['countryCode'] === country.countryCode; });
							*/
					$scope.demo['cc'] = [];
							  $scope.demo['cc'].push(country);
				
				}
            }]
        ];
 
});	