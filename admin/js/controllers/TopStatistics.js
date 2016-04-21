app.controller("SituationalAwareness", function($scope, $http, myService, crudSrv, rootURL) {
	//Bar Chart options.
	$scope.barOptions = myService.getIpsDetail("discreteBarChart");
	//Top attacking IPs/countries data.
	$scope.viewData = [{
		key: "key values",
		values: []
	}];
	crudSrv.getResults(rootURL.url.baseURL + "attacks/all/ips?size=10", function(data) {
		$scope.load = false;
		$scope.viewData[0].values = myService.getIPsDetailData(data, "ip", "hits");
		$scope.load = true;
	});
	//Attacks details over time data
	crudSrv.getResults(rootURL.url.baseURL + "global/attack-counts", function(data) {
		$scope.load = false;
		function compare(a, b) {
			if (b.hits < a.hits)
				return -1;
			else if (b.hits > a.hits)
				return 1;
			else
				return 0;
		}
		data.sort(compare);
		$scope.viewsData = [{
			key: "key values",
			values: []
		}];
		$scope.viewsData[0].values = myService.getIPsDetailData(data, "category", "hits");
		$scope.load = false;
	});
	$scope.PieOptions = myService.getCountriesDetail("pieChart");
	//Attacking Countries details data
	crudSrv.getResults(rootURL.url.baseURL + "global/attacking-countries?size=10", function(data) {
		//	onCountryDetails(data)
		$scope.countryData = [];
		$scope.countryData = myService.getServicesDetailData(data, "country", "hits");
	});

	//Attacking-Services Details
	crudSrv.getResults(rootURL.url.baseURL + "attacks/targeted-services?size=10", function(data) {
		$scope.servicesData = [];
		$scope.servicesData = myService.getServicesDetailData(data, "service", "hits");
	});
	//Top Tools used data
	crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/tools?size=10", function(data) {
		$scope.toolsData = [];
		$scope.hitsdata = [];
		$scope.hitsdata.push(myService.getToolsDetailData(data, "tools", "hits"));
		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else {
				$scope.toolsData.push(column.tools);
			}
		});
	});
	//Top username used.
	crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/usernames?size=10", function(data) {
		onUsernameDetails(data)
	});

	function onUsernameDetails(data) {
		$scope.polarData = {
			labels: [],
			data: []
		};
		$scope.userData = [];
		$scope.hitssdata = [];
		var jsonData = []; // array declaration
		data.forEach(function(column) {
			if (column.hasOwnProperty("root")) {} else {
				$scope.polarData.labels.push(column.username);
				$scope.polarData.data.push(column.hits);
				$scope.userData.push(column.username);
				$scope.hitssdata.push(column.hits);
			}
		});
	}
	// top username&password combination details.
	crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/credentials", function(data) {
		onPasswordsuDetails(data)
	});

	function onPasswordsuDetails(data) {
		$scope.datas = [];
		$scope.pulabelData = [];
		$scope.series = ['Series A'];
		var passsdata = [];
		var jsonData = []; // array declaration
		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else {
				$scope.pulabelData.push(column.password + "-" + column.username);
				passsdata.push(column.hits);
			}
		});
		$scope.datas.push(passsdata);
	}
	//Line Chart Options
	crudSrv.getResults(rootURL.url.baseURL + "attacks/targeted-ports?size=10", function(data) {
		onPortsDetails(data);
		$scope.lineChartOptions = myService.getPortsDetail("lineChart", $scope.viewwData);
		//Top Ports Details	
	});

	function onPortsDetails(data) {
		$scope.viewwData = [{
			key: "hits",
			values: []
		}];
		data.forEach(function(column, i) {

			var object = {
				label: "",
				value: ""
			};
			object.label = column.port;
			object.y = column.hits;
			object.x = i;
			$scope.viewwData[0].values.push(object);
		});
	}
	// Donut Chart Options
	$scope.optionsss = myService.getSensorsDetail("pieChart");
	//Top sensors details
	crudSrv.getResults(rootURL.url.baseURL + "attacks/sensors", function(data) {
		$scope.sensorsdata = [];
		console.log($scope.sensorsdata);
		$scope.sensorsdata = myService.getServicesDetailData(data, "sensor", "hits");
	});
	//Top Password details
	crudSrv.getResults(rootURL.url.baseURL + "attacks/ssh/passwords?size=10", function(data) {
		onPasswordsDetails(data)
	});

	function onPasswordsDetails(data) {
		$scope.passwrddata = [];
		$scope.plabelData = [];
		$scope.passwordhitdata = [];
		$scope.series = ['Series A'];
		var passdata = [];
		var jsonData = []; // array declaration
		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else {
				$scope.plabelData.push(column.password);
				passdata.push(column.hits);
			}
		});
		$scope.passwrddata.push(passdata);
	}
	//Top Urls Details
	crudSrv.getResults(rootURL.url.baseURL + "attacks/urls?size=8", function(data) {
		$scope.urlsData = data;
	});
	//Top Sip Details
	crudSrv.getResults(rootURL.url.baseURL + "attacks/tools?type=sip", function(data) {
		$scope.load = false;
		$scope.siptoolsData = [{
			key: "key values",
			values: []
		}];
		$scope.siptoolsData[0].values = myService.getIPsDetailData(data, "tools", "hits");
		$scope.load = true;
	});
	$scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
	$scope.series = ['Series A', 'Series B'];

	$scope.data = [
		[65, 59, 80, 81, 56, 55, 40],
		[28, 48, 40, 19, 86, 27, 90]
	];
});