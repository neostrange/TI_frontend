app.service('rootURL', function(){
	this.url = {
		"baseURL": "http://115.186.132.18:8080/TI/",
		"DjangoURL": "http://115.186.132.19:8008/",
	};
	

	this.jsonURL = {
		"baseURL": "http://172.20.16.57/",
	};
	
	this.openPage ={
		open:"http://115.186.132.18:8080/admin/#/"
	};

});


app.service("es",function(esFactory){
    return esFactory({
      //'host':"115.186.176.139:9200"
	  'host':"115.186.132.18:9200"
	  
    })
});


/*
app.factory('MyData', function($websocket) {
      // Open a WebSocket connection
      var dataStream = $websocket('ws://localhost:8081/');

      var collection = [];

      dataStream.onMessage(function(message) {
		 console.log(message); 
        collection.push(JSON.parse(message.data));
      });

      var methods = {
        collection: collection,
        get: function() {
          dataStream.send(JSON.stringify({ action: 'get' }));
        }
      };

      return methods;
});
*/
app.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect("ws://localhost:3016/");
    console.log("socket created");
 
    return {
        on: function (eventName, callback) {
            function wrapper() {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            }
            socket.on(eventName, wrapper);
            return function () {
                socket.removeListener(eventName, wrapper);
            };
        },
 
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);


app.service('utilityMethods', function($timeout, $rootScope, ngProgress, crudSrv, $state){
	var that = this;
//	'Malware Attacks', '{series.name}: <b>{point.percentage:.1f}%</b>'
    this.chartObj = function(chartSeries, chartTitle, format){
		
		var chartConfig = {
			options: {
				 plotOptions: {
			pie: {
			allowPointSelect: true,
			cursor: 'pointer',
			dataLabels: {
 			enabled: true,
 			formatter: function() {

 					percentage = this.percentage.toFixed(2);
 					if (percentage < 1) {
 						percentage = 'Less then 1';
 					}
 					return '<span style="font-size:11px; font-weight:bold;">' + this.key + ':</span> <span style="font-size:10px; font-weight:bold; color:#287DB1;">('+percentage+' %)</span > '
 						//return percentage;
 				}
 				//,
 				//format: '<span style="font-size:12px; font-weight:bold;">{point.name}: </span$
 		},
 		//showInLegend: true
 	}
 },
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'pie'
				},

				cursor: 'pointer',
			/*	dataLabels: {
					enabled: true,
			//		format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					allowPointSelect: true,
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					}
				}*/
			},
			series: chartSeries,
			title: {
				text: chartTitle
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};
		
		return chartConfig;
	};
	
	
	this.chartObjs = function(chartSeries, chartTitle, format, datalabel, categories, yTitle){
		var chartConfig = {
			options: {
				plotOptions: {
					column: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							align: 'left',
							rotation: 270,
							x: 2,
							y: -2,
							enabled: datalabel,
							format: '<span style="font-size:12px; font-weight:bold;">{point.name} </span> <span style="font-size:12px; font-weight:bold; color:#287DB1;"></span>'
						},
						//showInLegend: true
					}
				},
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'column',
				},

				cursor: 'pointer',
			},
			series: chartSeries,
			xAxis: {
			 categories:categories,
			 },yAxis: {
			     title:{
					 text:yTitle,
					 style:{ "color": "#000", "fontWeight": "bold", "font-size":"12px" }
				 }	
			},
			title: {
				text: chartTitle
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};	
		return chartConfig;
	};
	
	this.chartDonut = function(chartSeries, chartTitle, format, datalabel){
		
		var chartConfig = {
			options: {
				plotOptions: {
					pie: {
						innerSize: 80,
						depth: 45,
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: datalabel,
							format: '<span style="font-size:12px; font-weight:bold;">{point.name} </span> <span style="font-size:12px; font-weight:bold; color:#287DB1;"></span>'
						},
						//showInLegend: true
					}
				},
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'pie',
					options3d: {
						enabled: true,
						alpha: 45
					}
				},

				cursor: 'pointer',
			},
			series: chartSeries,
			title: {
				text: chartTitle
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};
		
		return chartConfig;
	};
	
	this.chartDot = function(chartSeries, chartTitle, format, datalabel, categories, yTitle){
		var chartConfig = {
			options: {
				 plotOptions: {
					areaspline: {
						  fillOpacity: 0.5,
						  cursor: 'pointer',
					}	  
				},
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'area'
				},
				cursor: 'pointer',
			},
			series: chartSeries,
			title: {
				text: chartTitle
			},
			 xAxis: {
				categories:categories
			},yAxis: {
			     title:{
					 text:yTitle,
					 style:{ "color": "#000", "fontWeight": "bold", "font-size":"12px" }
				 }	
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};
		return chartConfig;
	};
	
	
	this.chartLine = function(chartSeries, chartTitle, format, datalabel, categories, yTitle){
		var chartConfig = {
			options: {
				 plotOptions: {
					area: {
						stacking: 'normal',
						lineColor: '#666666',
						lineWidth: 1,
						marker: {
							lineWidth: 1,
							lineColor: '#666666'
						}
					}
				},
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'area'
				},
				cursor: 'pointer',
					global: {
					useUTC: false
				}
			},
			series: chartSeries,
			title: {
				text: chartTitle
			},
			 xAxis: {
			 categories:categories,
			 },
			 yAxis: {
			     title:{
					 text:yTitle,
					 style:{ "color": "#000", "fontWeight": "bold", "font-size":"12px" }
				 }	
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};
		return chartConfig;
	};
	
	
	this.chartLineWithoutArea = function(chartSeries, chartTitle, format, datalabel, categories, yTitle){
		var chartConfig = {
			options: {
				 plotOptions: {
					line: {
						lineColor: '#666666',		
					}
				},
				tooltip: {
					pointFormat: format
				},
				chart: {
					type: 'line'
				},
				cursor: 'pointer',
				global: {
					useUTC: false
				}
			},
			global:{
					useUTC: false
			},
			series: chartSeries,
			title: {
				text: chartTitle
			},
			 xAxis: {
			 categories:categories,
			 },
			 yAxis: {
			     title:{
					 text:yTitle,
					 style:{ "color": "#000", "fontWeight": "bold", "font-size":"12px" }
				 },
				min:0	
			},
			credits: {
				enabled: false
			},
			loading: false,
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
		};
		return chartConfig;
	};
	
	this.showMsgOnTop = function(msg, type, duration){
		$rootScope[type] = msg;
		$timeout(function(){
			$rootScope[type] = "";
		}, duration);
	};
	
	this.getAttackTypePagination = function($scope, pageNum , url , success, fail){
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

				  var url = rootURL.url.baseURL +"attacks/net-dos/ip-hits?page="+pageNum+"&limit="+limit+"&cc="+$scope.stateCode;
			 crudSrv.getResults( url,function(data, status){
				ngProgress.complete();
				success(data);
				 $scope.totalCount = data.total;
				 console.log($scope.totalCount , $scope.pagination.current);
				$scope.data = [];
				$scope.data = data.list;
			 
			  	$scope.safeApply();
				console.log(data);
				}, function(error){
				console.log(error);
				fail(error);
				});
	
	};
	
	
			this.refreshUISelect = function(query, url, qParam, $scope, key1, key2 ){
					var that = this;
					if(query.length > 0){
						var params = qParam;
						return $http
						.get(url,{params: params})
						.then(function(data) {
					    	data = data['data'];
					        data = that.checkGraphArray(data);
					    	if(rdfType != undefined){
					    		
						    	var obj = normalizeJSONLD.findAllObjectsByType(data['@graph'], rdfType);
								var object = normalizeJSONLD.normalizeLD(data['@graph'], obj);
								console.log(object);
								if((key1 != undefined) && (key2 != undefined)){
									$scope[key1][key2] = object;
								}else {
									$scope[key1] = object;
								}
					    	} else {
					    		if((key1 != undefined) && (key2 != undefined)){
									$scope[key1][key2] = data;
									console.log(data);
								}else {
									$scope[key1] = data;
									console.log(data);
								}
					    	}
					    }, function(){
					    	if((key1 != undefined) && (key2 != undefined)){
								$scope[key1][key2] = [];
							}else {
								$scope[key1] = [];
							}
					    });
						if((key1 != undefined) && (key2 != undefined)){
							$scope[key1][key2] = [];
						}else {
							$scope[key1] = [];
						}
					} else {
						if((key1 != undefined) && (key2 != undefined)){
							$scope[key1][key2] = [];
						}else {
							$scope[key1] = [];
						}
					}
				};
	
			this.countMarkers = function($scope, markerData){
		
		markerData.forEach(function(data, i) {
			 console.log(data);		
			 
			 if(data.remote_host === "220.142.5.180"){
				  if($scope.local_icons != undefined){
					var obj = {lat:parseFloat(data.latitude), lng: parseFloat(data.longitude), label: {
					 message: data.remote_host
					}, icon:$scope.local_icons.resturant_icon};
				  }else{
					  var obj = {lat:parseFloat(data.latitude), lng: parseFloat(data.longitude), label: {
					 message: data.remote_host
					}};
				  }
				  
			 }else{
				   if($scope.local_icons != undefined){
						 var obj = {lat:parseFloat(data.latitude), lng: parseFloat(data.longitude), label: {
						 message: data.remote_host
						}, icon:$scope.local_icons.leaf_icon};
				   }else{
					     var obj = {lat:parseFloat(data.latitude), lng: parseFloat(data.longitude), label: {
					 message: data.remote_host
					}};
				   }				
			 }
			
			$scope.markers.push(obj);
		});
	};
	
	
	this.addTInDateTime = function(date) {
					console.log(date);
					var newDate = date.replace(" ", "T");			
					return newDate;
	};
	
	this.countMarker = function(markerData){
		var markers = [];
		markerData.forEach(function(data, i) {
			 console.log(data);
			 console.log(i);
			var obj = {lat:parseFloat(data.latitude), lng: parseFloat(data.longitude), label: {
				 message: data.remote_host
			}};
			markers.push(obj);
		
		});
		
		return markers;
	};
	
	this.objToArray = function(obj) {
		if (obj != undefined) {
			var arr1 = obj;
			if (_.isArray(arr1) == false) {
				console.log("Not an array");
				obj = [];
				obj.push(arr1);
				return obj;
			} else {
				return obj;
			}
		}
	};
	
	
	this.getJson = function(){
	var ar = {
		"ports": [
	  445,
	  81,
	  21,
	  1433,
	  3306,
	  5061,
	  5060,
	  135,
	  139,
	  554,
	  42,
	  22,
	  80,
	  8008
	],
	  "sensors": [
		"sensor00",
		"sensor01",
		"sensor02",
		"sensor03",
		"sensor04"
	  ],
	  "attacks": [
		 "web",
		 "malware",
		 "database",
		 "ssh",
		"probing",
		"sip"
	  ]
	};
 return ar;
	};
	
	this.getType = function(service,ob){
			var type ;
			if(ob.hasOwnProperty('category')){
				if(ob.category === "Reconnaissance"){
					type = "probing";
				}
			}else{
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
			}
	
		return type;
	};
	
	this.commonElasticQuery = function(query, type, success, fail){
	
			if((type != undefined) && (type != "")){
					es.search({index:"incident",
					type:type,
					search_type:"count",
					body:query
					}).then(function(resp){
						success(resp);
					},function(err){
						fail(err);
					});
			}else{
					es.search({index:"incident",
					search_type:"count",
					body:query
					}).then(function(resp){
						success(resp);
					},function(err){
						fail(err);
					});
			}	
	};
	
	this.commonElasticWithoutCount = function(query, type, success, fail){
	
			if( (type != undefined) && (type != "")){
				
					es.search({index:"incident",
					type:type,
					body:query
					}).then(function(resp){
						success(resp);
					},function(err){
						fail(err);
					});
			}else{
					es.search({index:"incident",
					body:query
					}).then(function(resp){
						success(resp);
					},function(err){
						fail(err);
					});
			}
		
	};
	
	this.countryQuery = function()
	{
		var query ={
					"aggs": {
						"fewCountries": {
							"terms": { "field": "origin.srcCountry",
                             "order" : { "_count" : "desc" },
                            "size":10
                        }
                    }
                }
			};
		return query;
	};
	
	
	this.variableQuery = function(qu)
	{
		var query ={
			"aggs" : {
				"fewCountries" : {
					"terms" : {
						"field" : qu 
					}
				}
			}
		};
		return query;
	};
	
	this.variableQueryDateTime = function(qu, d1, d2){
		var query ={
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
						"aggs" : {
							"fewCountries" : {
								"terms" : {
									"field" : qu 
								}
							}
						}
			};
			return query;
	};
	
	this.countryQueryDateTime = function(d1, d2){
		var query = {
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
				"country":{
					"terms":{
						"field":"origin.srcCountry"
					}
				}
			}
		};
		
		return query;
	};
	
	this.countryIPQuery = function(){
		query = { 
                "aggs": {
                    "topIp": {
                        "terms": { "field": "srcIP",
                             "order" : { "_count" : "desc" },
                            "size":10
                        },
                        "aggs":{
                            "remote_country":{
                                "terms":{
                                    "field":"origin.srcCountryCode"
                                }
                            }
                        }
                        
                        }
                    }
               };
		return query;
	};
	
	this.countryIPDateTime = function(d1, d2){
			var query = {  
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
            "remote_host":{
                "terms":{
                    "field":"srcIP"
                },
                "aggs":{
                    "remote_country":{
                        "terms":{
                            "field":"origin.srcCountryCode"
                            
                        }                    
                    }
                }
            }
		}
		};
	
	   return query;
	};
	
	this.globalAttacksQuery = function(country){
		
		var query = {
	"aggs": {
		"SSH_Attacks": {
			"filter": {
				 "query": {
                "wildcard": {
                  "origin.srcCountry": "*"+country+"*"
                }
            }
			}
		},
		"Application_Exploit_Attempt": {
			"filter": {
				"bool": {
					"should": [{
						"query": {
							"wildcard":{"WebIncident.origin.srcCountry":"*"+country+"*"}
							
						}
					}, {
						"query": {
							"wildcard":{
							"SipIncident.origin.srcCountry": "*"+country+"*"
							}
						}
					}]
				}
			}
		},
		"Network_Exploit_Attempt": {
			"filter": {
				"query": {
					"wildcard":{
					"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
					}
				}
			}
		},
		"Database_Attacks": {
			"filter": {
				"bool": {
					"should": [{
						"query": {
							"wildcard":{
							"MysqlIncident.origin.srcCountry": "*"+country+"*"
							}
						}
					}, {
						"query": {
							"wildcard":{
							"MssqlIncident.origin.srcCountry": "*"+country+"*"
							}
						}
					}]
				}
			}
		},
		"Reconnaissance": {
			"filter": {
				"and": [{
					"query": {
						"wildcard":{
						"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"term": {
						"NetworkLayerIncident.signatureClass": "attempted-recon"
					}
				}]
			}
		},
		"Dos_Attacks": {
			"filter": {
				"and": [{
					"query": {
						"wildcard":{
						"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"term": {
						"NetworkLayerIncident.signatureClass": "attempted-dos"
					}
				}]
			}
		},
		"Policy_Voilation": {
			"filter": {
				"and": [{
					"query": {
						"wildcard":{
						"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				},
				{
				"query": {
                "wildcard": {
              "NetworkLayerIncident.signatureClass": "*policy*"
				}
			}}
			]
			}
		},
		"Possible_Compromise": {
			"filter": {
				"and": [{
					"query": {
						"wildcard":{
						"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, 
					{
						"query": {
					"wildcard": {
						"NetworkLayerIncident.signatureClass": "*compromise*"
					}
				}
			}
			]
			}
		},
		"VirusInfection": {
			"filter": {
				"and": [{
					"query": {
						"wildcard":{
						"MalwareIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"exists": {
						"field": "MalwareIncident.vtScan.VTscanResults.Kaspersky"
					}
				}]
			}
		}
	}
};

     return query;
	};
	
	this.globalAttacksQueryDateTime = function(country,d1, d2){
		   var query = 	{
  "aggs": {
    "SSH_Attacks": {
      "filter": {
          "and":[
       {"query": {
                "wildcard": {
                  "origin.srcCountry": "*"+country+"*"
                }
            }},
            { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
            ]
      }
    },
    "Application_Exploit_Attempt": {
        "filter": {
          "bool":{
              "should":[
                  {
                  "and":  [
                        {       
                        "query": {
                                "wildcard": {
                              "SipIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          { "range":{
                                    "dateTime":{
                                        "gte":d1,
                                        "lte":d2
                                    }        
                                  }}
                                            
                    ]
                  },
                  {
                      "and":[
                           {       
                        "query": {
                                "wildcard": {
                              "WebIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          { "range":{
                                    "dateTime":{
                                        "gte":d1,
                                        "lte":d2
                                    }        
                                  }}
                          ]
                  }
                  
      ]}
    }},
    "Network_Exploit_Attempt": {
      "filter": {
          "and":[{
        "query": {
            "wildcard": {
             
          "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
        }
      }},
      { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
      ]
    }},
    "Database_Attacks": {
      "filter": {
          "bool":{
              "should":[
                  {
                  "and":  [
                        {       
                        "query": {
                                "wildcard": {
                              "MssqlIncident.origin.srcCountry":"*"+country+"*"
                            }
                          }},
                          { "range":{
                                    "dateTime":{
                                        "gte":d1,
                                        "lte":d2
                                    }        
                                  }}
                                            
                    ]
                  },
                  {
                      "and":[
                           {       
                        "query": {
                                "wildcard": {
                              "MysqlIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          { "range":{
                                    "dateTime":{
                                        "gte":d1,
                                        "lte":d2
                                    }        
                                  }}
                          ]
                  }
                  
      ]}
    }
      },
    "Reconnaissance": {
      "filter": {
        "and": [
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
            }
          }},
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.signatureClass": "*attempted-recon*"
            }
          }},
          { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
        ]
      }
    },
    "Dos_Attacks": {
      "filter": {
        "and": [
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
            }
          }},
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.signatureClass": "attempted-dos"
            }
          }},
           { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
        ]
      }
    },
    "Policy_Voilation": {
      "filter": {
        "and": [
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
            }
          }},
          {
            "query": {
                "wildcard": {
              "NetworkLayerIncident.signatureClass": "*policy*"
            }
          }
        },
         { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
      ]
    }},
    "Possible_Compromise": {
      "filter": {
        "and": [
          {
              "query":{
            "wildcard": {
              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
            }
          }},
          {
            "query": {
                "wildcard": {
                  "NetworkLayerIncident.signatureClass": "*possible*compromise*"
                }
            }
          },
           { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
        ]
      }
    },
    "VirusInfection": {
      "filter": {
        "and": [
          {
            "query": {
				"wildcard":{
              "MalwareIncident.origin.srcCountry": "*"+country+"*"
				}
			}
          },
          {
            "exists": {
              "field": "MalwareIncident.vtScan.VTscanResults.Kaspersky"
            }
          },
           { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
        ]
      }
    }
  }
};
			
			return query;
		};
	
	this.topWebAttacksQuery = function(){
		var query ={ 

		"aggs":{
            "SqlInjection":{
            "filter":{
                "bool":{
                    "must": [
                   {
                       "query": { 
                       "wildcard": {
                    
                          "WebIncident.rulesList.ruleMessage": "*SQL*Injection*" }}}  
                ]
            }
        }
    },
    
    "Spam":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                          "WebIncident.rulesList.ruleMessage": "*SPAM*"
                       }}
                   }
                ]
            }
        }
    },
      "Proxy_Abuse":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                                  "WebIncident.rulesList.ruleMessage": "*Proxy*Abuse*"
                       }}
                   }
                ]
            }
        }
    },
      "Session_Hijecking":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                          "WebIncident.rulesList.ruleMessage": "*Session*"
                       }}
                   }
                ]
            }
        }
    },
     "Crose_Site_Request":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                          "WebIncident.rulesList.ruleMessage": "*Cross-site*Scripting*"
                       }}
                   }
                ]
            }
        }
    },
    "SourceCode_Leakage":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                          "WebIncident.rulesList.ruleMessage": "*Leakage*"
                       }}
                   }
                ]
            }
        }
    },
     "Request_Anomaly":{
        "filter":{
            "bool": {
                "must": [
                   {
                              "query": { "wildcard":{
                          "WebIncident.rulesList.ruleMessage": "*Request*"
                       }}
                   }
                ]
            }
        }
    } 
}};
    return query;
	};
	
	this.topWebAttacksQueryDateTime = function(d1, d2) {
	var query = {
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
		"aggs": {
			"SqlInjection": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {

									"WebIncident.rulesList.ruleMessage": "*SQL*Injection*"
								}
							}
						}]
					}
				}
			},

			"Spam": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*SPAM*"
								}
							}
						}]
					}
				}
			},
			"Proxy_Abuse": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*Proxy*Abuse*"
								}
							}
						}]
					}
				}
			},
			"Session_Hijecking": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*Session*"
								}
							}
						}]
					}
				}
			},
			"Crose_Site_Request": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*Cross-site*Scripting*"
								}
							}
						}]
					}
				}
			},
			"SourceCode_Leakage": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*Leakage*"
								}
							}
						}]
					}
				}
			},
			"Request_Anomaly": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"WebIncident.rulesList.ruleMessage": "*Request*"
								}
							}
						}]
					}
				}
			}
		}
	};
	return query;
};
	
	this.globalLatLongQuery =function(country)
	{
		var query ={
			   "aggs" : {
				   "country":{
				  "filter" : {
					"query" : {
						"wildcard": {
							  "origin.srcCountry" : "*"+country+"*"
						}
					 }
				   },
				   "aggs":{
					  "IP":{
						  "terms":{
							  "field":"srcIP",
							   "min_doc_count":1000,
								"size":0
						  },
						  
						  "aggs":{
								 
								  "long":{
									  "terms":{
										  "field":"origin.geoPoint.lon"
									  }
								  },
								   "lat":{
									  "terms":{
										  "field":"origin.geoPoint.lat"
									  }
								  }
							  }
					  }
					  
					  }   
				   }
				   }
			};
		return query;
	}; 
	
	
	this.globalLatLongQueryDateTime =function(country, d1, d2)
	{
		var query ={
   "aggs" : {
       "country":{
      "filter" : {
        "and" :[ {
            "query":{
            "wildcard":{
           "origin.srcCountry" : "*"+country+"*"
         }}},
         { "range":{
                                    "dateTime":{
                                        "gte":d1,
                                        "lte":d2
                                    }        
                                  }}
         ]
       },
       "aggs":{
          "IP":{
              "terms":{
                  "field":"srcIP"
              },
              
              "aggs":{
                     
                      "long":{
                          "terms":{
                              "field":"origin.geoPoint.lon"
                          }
                      },
                       "lat":{
                          "terms":{
                              "field":"origin.geoPoint.lat"
                          }
                      }
                  }
          }
          
          }   
       }
       }
	};
		return query;
	}; 
	
	
	///////////////////////////////////      SIP Country all ///////////////////////////////////////

	 this.globalCountQuery = function(){
		var query = {
		"aggs": {
		"Country": {
			"terms": {
				"field": "origin.srcCountry"
			},
			"aggs": {
				"code": {
					"terms": {
						"field": "origin.srcCountryCode"
					}
				}
			}
			}
		}
	}; 
	
	  return query;
	 };
	 
	 this.globalCountQueryDateTime = function(d1,d2){
		var query = {
    "aggs":{
        "Time":{
            "filter":{
                "bool": {"must": [
                   { "range":{
                "dateTime":{
                    "gte":d1,
                    "lte":d2
                }        
              }}
                ]}
            },
        "aggs":{
        "Country":{
            "terms":{"field":"origin.srcCountry"
           },
           "aggs":{
               "code":{
                   "terms":{
                       "field":"origin.srcCountryCode"
                   }
               }
           }
        }
    }
}}};
	
	  return query;
	 };
	
	this.globalDBQuery = function(country){
		
		
		var query = {
    "aggs":{
        "Attack":{
        "filter":{
            "bool":{
            "should": [
              {  "and":[
                  {
                  "query":{
                    "wildcard":{
                        "MysqlIncident.origin.srcCountry":"*"+country+"*"
                    }
                }}
                ]},
         {       "and":[
                {  "query":{
                    "wildcard":{
                        "MssqlIncident.origin.srcCountry":"*"+country+"*"
                    }
                }
                }
               ]}]
            }}
        },
       "Probing_IP": {
        "filter": {
          "bool":{
              "should":[
                  {
                  "and":  [
                        {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*misc-activity*"
                            }
                          }}
                                            
                    ]
                  },
                  {
                      "and":[
                           {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*misc-activity*"
                            }
                          }}
                          ]
                  }
                  
      ]}
    },
      "aggs":{
          "IP":{
              "terms":{
                  "field":"srcIP"
              }
            }
          }
    },
       "my_sql":{
           "filter":{
               "and":[ {
                "query":{
                "wildcard": {
                      "MysqlIncident.origin.srcCountry": "*"+country+"*"
                   }
                }
               }]
           }
       },
       "ms_sql":{
           "filter":{
               "and":[ {
                "query":{
                "wildcard": {
                      "MssqlIncident.origin.srcCountry": "*"+country+"*"
                   }
                }
               }]
           }
       }       
    }
    };
	
	return query;
	};
	
	this.globalDBLatLong = function(country){
		var query = {
   "aggs" : {
       "country":{
      "filter" : {
          "bool":{
              "should":[{
        "and" :[ {
            "query":{
            "wildcard":{
           "MssqlIncident.origin.srcCountry" : "*"+country+"*"
         }}}
         ]},
         {
        "and" :[ {
            "query":{
            "wildcard":{
           "MysqlIncident.origin.srcCountry" : "*"+country+"*"
         }}}
         ]}]
       }},
       "aggs":{
          "IP":{
              "terms":{
                  "field":"srcIP"
              },
              
              "aggs":{
                     
                      "long":{
                          "terms":{
                              "field":"origin.geoPoint.lon"
                          }
                      },
                       "lat":{
                          "terms":{
                              "field":"origin.geoPoint.lat"
                          }
                      }
                  }
				}
          
			}   
			}
       }
		};
		
		return query;
};
	
	
	
	this.globalWebQuery =function(country)
	{
		var query = {
    "aggs":{
        "Attacks":{
        "filter":{
            "bool": {"must": [
               {
                   "term": {
                      "WebIncident.origin.srcCountry": "*"+country+"*"
                   }}
            ]}
            
           }
        },
      "probingIP": {
        "filter": {
          "bool":{
              "should":[
                  {
                  "and":  [
                        {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*misc-activity*"
                            }
                          }}
                                            
                    ]
                  },
                  {
                      "and":[
                           {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*attempted-recon*"
                            }
                          }}
                          ]
                  }
                  
      ]}
    },
      "aggs":{
          "IP":{
              "terms":{
                  "field":"srcIP"
              }
            }
          }
    },
        "Browsing":{
        "filter":{
            "and":[
                {
                  "query":{
                  "wildcard":{
                      "WebIncident.origin.srcCountry":"*"+country+"*"
                  }
                  }  
                },
               {
                   "query": {
                   "wildcard": {
                      "WebIncident.rulesList.ruleMessage": "*Forced*Browsing*"
                   }
               }}
            ]
            
               }
            
           },
        "sql_Injection":{
        "filter":{
            "and": [
                {
                  "query":{
                  "wildcard": {
                     "WebIncident.origin.srcCountry":"*"+country+"*"
                  }
                  }  
                },
               {
                   "query": {
                   "wildcard": {
                      "WebIncident.rulesList.ruleMessage": "*SQL*Injection*"
                   }
               }}
            ]
            
               }
            
           },
        "remote_File_Inclusion":{
        "filter":{
            "and": [
                {
                "query":{
                    "wildcard": {
                       "WebIncident.origin.srcCountry":"China"
                    }
                }
                },
               {
                   "query": {
                   "wildcard": {
                      "WebIncident.rulesList.ruleMessage": "*"+country+"*"
                   }
               }}
            ]
            
               }
            
           },
       "remote_File_Exploitation":{
        "filter":{
            "and": [
                {
                    "query":{
                    "wildcard": {
                       "WebIncident.origin.srcCountry":"*"+country+"*"
                    }}
                },
               {
                   "query": {
                   "wildcard": {
                      "WebIncident.rulesList.ruleMessage": "*remote*file*exploiation*attack*"
                   }
               }}
            ]
            
               }
            
           },
    "information_leakage":{
        "filter":{
            "and": [
               {
                   "query": {
                   "wildcard": {
                      "WebIncident.rulesList.ruleMessage": "*Information*Leakage*"
                   }
               }}
            ]
            
               }
            
           }
        
    }};
	
	return query;	
	};
	
	this.globalSipQuery = function(country){
		var query = {
    "aggs":{
        "attacks":{
        "filter":{
            "bool": {"must": [
               {
                   "query":{
                   "wildcard": {
                      "SipIncident.origin.srcCountry": "*"+country+"*"
                   }
               }}
            ]}
            
           }
        },
       "probingIP": {
        "filter": {
          "bool":{
              "should":[
                  {
                  "and":  [
                        {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry":"*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*misc-activity*"
                            }
                          }}                
                    ]
                  },
                  {
                      "and":[
                           {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
                            }
                          }},
                          {       
                        "query": {
                                "wildcard": {
                              "NetworkLayerIncident.signatureClass": "*attempted-recon*"
                            }
                          }}
                          ]
                  }
                  
      ]}
    },
      "aggs":{
          "IP":{
              "terms":{
                  "field":"srcIP"
              }
            }
          }
    },
     "registrarFlooding":{
        "filter":{
            "and": [
                {
                  "query":{
                  "wildcard":{
                      "SipIncident.origin.srcCountry": "*"+country+"*"
                  }
                  }  
                },
               {
                   "term": {
                      "SipIncident.sipMethod": "REGISTER"
                   }
               }
            ]}
            
           },
         "optionFlooding":{
        "filter":{
            "and": [
                {
                "query":{
                    "wildcard": {
                       "SipIncident.origin.srcCountry": "*"+country+"*"
                    }
                }
                },
               {
                   "term": {
                      "SipIncident.sipMethod": "OPTIONS"
                   }
               }
            ]}
           },
         "floodProxy":{
        "filter":{
            "and": [
                {
                "query":{
                    "wildcard":{
                        "SipIncident.origin.srcCountry": "*"+country+"*"
                    }
                }
                },
               {
                   "term": {
                      "SipIncident.sipMethod": "INVITE"
                   }
               }
            ]}
           }
}};
		
		return query;
	};
	
	this.globalWebSipLatLong = function(country){
		var query =  {
	"aggs": {
		"country": {
			"filter": {
				"bool": {
					"should": [{
						"and": [{
							"query": {
								"wildcard": {
									"SipIncident.origin.srcCountry": "*"+country+"*"
								}
							}
						}]
					}, {
						"and": [{
							"query": {
								"wildcard": {
									"WebIncident.origin.srcCountry":"*"+country+"*"
								}
							}
						}]
					}]
				}
			},
			"aggs": {
				"IP": {
					"terms": {
						"field": "srcIP"
					},

					"aggs": {

						"long": {
							"terms": {
								"field": "origin.geoPoint.lon"
							}
						},
						"lat": {
							"terms": {
								"field": "origin.geoPoint.lat"
							}
						}
					}
				}

			}
		}
	}
};
		
		return query;
	};
	
	this.globalSshLatLong = function(country){
		var query = {
	"aggs": {
		"country": {
			"filter": {
				"bool": {
					"should": [{
						"and": [{
							"query": {
								"wildcard": {
									"SshIncident.origin.srcCountry": "*"+country+"*"
								}
							}
						}]
					}]
				}
			},
			"aggs": {
				"IP": {
					"terms": {
						"field": "srcIP"
					},

					"aggs": {

						"long": {
							"terms": {
								"field": "origin.geoPoint.lon"
							}
						},
						"lat": {
							"terms": {
								"field": "origin.geoPoint.lat"
							}
						}
					}
				}

			}
		}
	}
};
		return query;
	};
	
	this.globalSshQuery = function(country){
		var query = {
	"aggs": {
		"attacks": {
			"filter": {
				"bool": {
					"must": [{
						"query": {
							"wildcard": {
								"SshIncident.origin.srcCountry": "*"+country+"*"
							}
						}
					}]
				}
			}
		},
		"success": {
			"filter": {
				"and": [{
					"query": {
						"wildcard": {
							"SshIncident.origin.srcCountry":"*"+country+"*"
						}
					}
				}, {
					"exists": {
						"field": "SshIncident.authList.success"
					}
				}]
			}
		},
		"probingIP": {
			"filter": {
				"bool": {
					"should": [{
							"and": [{
									"query": {
										"wildcard": {
											"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
										}
									}
								}, {
									"query": {
										"wildcard": {
											"NetworkLayerIncident.signatureClass": "*misc-activity*"
										}
									}
								}

							]
						}, {
							"and": [{
								"query": {
									"wildcard": {
										"NetworkLayerIncident.origin.srcCountry": "*"+country+"*"
									}
								}
							}, {
								"query": {
									"wildcard": {
										"NetworkLayerIncident.signatureClass": "*attempted-recon*"
									}
								}
							}]
						}

					]
				}
			},
			"aggs": {
				"ip": {
					"terms": {
						"field": "srcIP"
					}
				}
			}
		},
		"userName": {
			"filter": {
				"and": [{
					"query": {
						"wildcard": {
							"SshIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"exists": {
						"field": "SshIncident.authList.username"
					}
				}]
			}
		},
		"password": {
			"filter": {
				"and": [{
					"query": {
						"wildcard": {
							"SshIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"exists": {
						"field": "SshIncident.authList.password"
					}
				}]
			}
		},
		"input": {
			"filter": {
				"and": [{
					"query": {
						"wildcard": {
							"SshIncident.origin.srcCountry": "*"+country+"*"
						}
					}
				}, {
					"exists": {
						"field": "SshIncident.inputList.command"
					}
				}]
			}
		}
	}
};
		
		return query;
	};	
	
	this.globalSshUPI = function(country){
	  var query = {
		"aggs": {
			"user": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"SshIncident.origin.srcCountry": "*"+country+"*"
								}
							}
						}]
					}
				},
				"aggs": {
					"user": {
						"terms": {
							"field": "SshIncident.authList.username"
						}
					}
				}
			},

			"password": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"SshIncident.origin.srcCountry": "*"+country+"*"
								}
							}
						}]
					}
				},
				"aggs": {
					"password": {
						"terms": {
							"field": "SshIncident.authList.password"
						}
					}
				}
			},
			"input": {
				"filter": {
					"bool": {
						"must": [{
							"query": {
								"wildcard": {
									"SshIncident.origin.srcCountry": "*"+country+"*"
								}
							}
						}]
					}
				},
				"aggs": {
					"input": {
						"terms": {
							"field": "SshIncident.inputList.command"
						}
					}
				}
			}
		}
	};

		return query;
	};	
	this.globalVirusQuery = function(country) {
		var query = {

			"aggs": {
				"dateTime": {
					"filter": {
						"bool": {
							"must": [{
								"query": {
									"wildcard": {
										"MalwareIncident.origin.srcCountry": "*"+country+"*"
									}
								}
							}]
						}
					},
					"aggs": {
						"malware": {
							"terms": {
								"field": "MalwareIncident.vtScan.VTscanResults.Kaspersky"
							}
						}
					}
				}
			}
		};

		return query;
	};
	
	
	this.globalHashQuery = function(country, type){

		var query = { 
    "fields": [
       "md5Hash"
    ], 
    "query": {"match_all": {}},
    "filter": {"bool": {"must": [
       {"term": {
          "vtScan.VTscanResults.Kaspersky":type
       }},
       {
                 "query":{
                  "wildcard":{
                   "MalwareIncident.origin.srcCountry" : "*"+country+"*"
                    } 
                  }         
        }
    ]}}
};
		return query;
	};
	
	this.globalQuerySingleIP = function(country,ip){
		var query ={
			"aggs": {
	"attacks": {
		"filter": {
			"bool": {
				"must": [{
					"term": {
						"srcIP": ip
					}
				}, {
					"term": {
						"origin.srcCountry": country
					}
				}]
			}
		},
		"aggs": {
			"country": {
				"terms": {
					"field": "origin.srcCountry"
				},
				"aggs": {
					"countryCode": {
						"terms": {
							"field": "origin.srcCountryCode"
						}
					},
					"City": {
						"terms": {
							"field": "origin.city"
						}
					},
					"longitude": {
						"terms": {
							"field": "origin.geoPoint.lon"
						}
					},
					"latitude": {
						"terms": {
							"field": "origin.geoPoint.lat"
						}
					}
				}
			}
		}
	},
	"Probing": {
		"filter": {
			"bool": {
				"should": [{
					"and": [{
						"query": {
							"match_all": {}
						}
					}, {
						"term": {
							"NetworkLayerIncident.signatureClass": "attempted-recon"
						}
					}, {
						"term": {
							"srcIP": ip
						}
					}, {
						"term": {
							"origin.srcCountry": country
						}
					}]
				}, {
					"and": [{
						"term": {
							"srcIP": ip
						}
					}, {
						"term": {
							"NetworkLayerIncident.signatureClass": "misc-activity"
						}
					}, {
						"term": {
							"origin.srcCountry": country
						}
					}]
				}]
			}
		}
	}
	}
};
	
	return query;
	};
	
	
	this.applicationHeader = function(){
		return {
				jsonConfig:{ 
					headers:{ 
						 'Content-Type': 'application/json',
						'Accept': 'application/pdf'
					}
				},
				
				config:{
					headers:{
						'Content-Type' : 'application/ld+json',
						'Authorization': 'Bearer '+ $cookies.api_id 
					}

				},
				
				tsConfig:{
					headers:{
						'Accept': 'application/ld+json',
						'Authorization': 'Bearer '+ $cookies.ts_id 
					}

				}

			}
		};
	
	
});
	

app.service('crudSrv', function($http, rootURL , Upload){
    this.getResults = function(url, success, error){
		$http.get(url).success(function(data, status){
			success(data, status);
		}).error(function(data, status){
			error(data, status);
		});
	};
	
	this.createRequest = function(url, data,header,success, error){
		var req = {
		 method: 'POST',
		 url: url,
		 headers: header,
		 data: data,
		 responseType: "arraybuffer"
		};
		
		
		$http(req).success(function(data, status){
			success(data, status);
		}).error(function(data, status){
			error(data, status);
		});
	};
	
	
	this.deleteResults = function(url, success, error){
		$http.delete(url).success(function(data, status){
			success(data, status);
		}).error(function(data, status){
			error(data, status);
		});
	};
	
	
	this.fileUploadOnServer = function(file, $scope, callback) {
		var apiUrl = rootURL.url.baseURL + "config/upload/config_type=sensor";
		//$scope.confirmCheck = true;
		var upload = Upload.upload({
			url: apiUrl,
			file: file,
		}).progress(function(evt) {
			$scope.confirmCheck = true;
			console.log('FUS: progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + evt.config.file.name);
		}).success(function(data, status, headers, config) {
			//$scope.confirmCheck = false;
			callback(data);
		});
		
		$scope.$on("$locationChangeStart", function(event){
			if($scope.confirmCheck == true){
				var returnConfirm = confirm("Image upload in progress. Do you really want to leave?");
				if(returnConfirm == false){
					event.preventDefault();
				} else {
					$scope.confirmCheck = false;
					upload.abort();
				}
			}
		});
		
	};
	
});

														
app.service('menuItemSrv', function($http){
    this.getMenuList = {
		"sip" : [{
			"link" : "#/sipAtck",
			"title" : "Attacks"
		},{
			"link" : "#/sipRegistrarServerAtck",
			"title" : "Registrar Server Attacks"
		},{
			"link" : "#/sipOptionFloodingAtck",
			"title" : "Option Flooding Attacks"
		},{
			"link" : "#/sipFloodingProxyAtck",
			"title" : "Flooding Proxy Server Attacks"
		},{
			"link" : "#/sipTools",
			"title" : "Tools"
		}],
		"malware":[{
			"link" : "#/probingCountries",
			"title" : "Most Probing Countries"
		},{
			"link" : "#/probCountriesUIP",
			"title" : "Most Probing Countries – Unique IP's"
		},{
			"link" : "#/probingIP",
			"title" : "Most Probing IP's"
		},{
			"link" : "#/attackingIP",
			"title" : "Most Attacking IP's"
		},
		{
			"link" : "#/attackingCountries",
			"title" : "Most Attacking Countries"
		},{
			"link" : "#/attackingIPFix",
			"title" : "Attacking IP's – 10 Attacks"
		},{
			"link" : "#'/topVulnerabilities",
			"title" : "Top Vulnerabilities"
		},{
			"link" : "#/detectedMalwares",
			"title" : "Top Few Malwares Detected"
		},{
			"link" : "#/cncIP",
			"title" : "Cnc IP's & Domains"
		},{
			"link" : "#/attackedProtocol",
			"title" : "Attacked Protocols"
		}],
		
		"web" : [{
			"link" : "#/topFewCountries",
			"title" : "Top Few Countries"
		},{
			"link" : "#/topFewIPs",
			"title" : "Top Few IP Addresses"
		},{
			"link" : "#/topFewWebAttacks",
			"title" : "Top Few Web Attacks"
		}],
		
		"brute" : [{
			"link" : "#/mostUsedUsernames",
			"title" : "Most Usernames Used"
		},{
			"link" : "#/mostUsedPswd",
			"title" : "Most Passwords Used"
		},{
			"link" : "#/topIPsSSHAtck",
			"title" : "IP's Conducting SSH Attacks"
		},{
			"link" : "#/toolsSSHAtck",
			"title" : "Tools Used For SSH Attacks"
		}],
		
	};
		
	
	this.createRequest = function(url, data, success, error){
		var req = {
		 method: 'POST',
		 url: url,
		 headers: {
		   'Content-Type': 'application/json'
		 },
		 data: data
		};
		
		$http(req).success(function(data, status){
			success(data, status);
		}).error(function(data, status){
			error(data, status);
		});
	};

});


app.service('myService', [function() {
	this.getSensorsDetail = function(url) {
		var donutChartOptions = {
			chart: {
				type: url,
				height: 350,
				donut: true,
				x: function(d) {
					return d.label;
				},
				y: function(d) {
					return d.value;
				},
				valueFormat: function(d) {
					return d3.format()(d);
				},
				showLabels: true,
				pie: {
					startAngle: function(d) {
						return d.startAngle - Math.PI
					},
					endAngle: function(d) {
						return d.endAngle - Math.PI
					}
				},
				duration: 500,
				legend: {
					margin: {
						top: 5,
						right: 70,
						bottom: 5,
						left: 0
					}
				}
			}
		};
		return donutChartOptions;
	};
	this.getIpsDetail = function(type) {
		var barChartOptions = {
			chart: {
				type: type,
				height: 340,
				width: 499,
				rotateLabels: (-35),
				x: function(d) {
					return d.label;
				},
				y: function(d) {
					return d.value;
				},
				margin: {
					left: 70,
					bottom: 90,
					right: 30
				},
				showValues: false,
				legend: {
					margin: {
						top: 5,
						right: 15,
						bottom: 5,
						left: 0
					}
				},
				xAxis: {
					rotateLabels: -20
				},
				yAxis: {
					axisLabel: 'Hits',
					axisLabelDistance: 30,
					tickFormat: function(d) {
						return d3.format('d')(d)
					}

				},
				dispatch: {
					tooltipShow: function(e) {
						console.log('! tooltip SHOW !')
					},
					tooltipHide: function(e) {
						console.log('! tooltip HIDE !')
					},
					beforeUpdate: function(e) {
						console.log('! before UPDATE !')
					}
				},
				discretebar: {
					dispatch: {
						//chartClick: function(e) {console.log("! chart Click !")},
						elementClick: function(e) {
							console.log("! element Click !")
						},
						elementDblClick: function(e) {
							console.log("! element Double Click !")
						},
						elementMouseout: function(e) {
							console.log("! element Mouseout !")
						},
						elementMouseover: function(e) {
							console.log("! element Mouseover !")
						}
					}
				},
				callback: function(e) {
					console.log('! callback !')
				}
			}
		};
		return barChartOptions;
	};
	this.getCountriesDetail = function(type) {
		var pieChartOptions = {
			chart: {
				type: 'pieChart',
				height: 500,
				x: function(d) {
					return d.label;
				},
				y: function(d) {
					return d.value;
				},
				valueFormat: function(d) {
					return d3.format()(d);
				},
				showLabels: true,
				duration: 500,
				labelThreshold: 0.01,
				labelSunbeamLayout: true,
				legend: {
					margin: {
						top: 5,
						right: 35,
						bottom: 0,
						left: 0
					}
				}
			}

		};
		return pieChartOptions;
	};

	this.getPortsDetail = function(type, viewData) {
		var lineChartOptions = {
			chart: {
				type: type,
				height: 550,
				width: 900,
				margin: {
					top: 20,
					right: 0,
					bottom: 40,
					left: 55
				},
				x: function(d) {
					return d.x;
				},
				y: function(d) {
					return d.y;
				},
				useInteractiveGuideline: false,
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
					axisLabel: 'Ports',
					tickFormat: function(d) {
						var l = viewData[0].values[d].label;
						return l;
					},
				},
				yAxis: {
					axisLabel: 'Hits',
					axisLabelDistance: 100
				},
				callback: function(chart) {

				}
			},
			title: {
				enable: true,
				text: 'Title for Line Chart'
			}
		};
		return lineChartOptions;
	};
	this.getIPsDetailData = function(data, key, value) {
		var viewsData = [];

		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else if (column.hits == 0) {} else {
				var objects = {
					label: "",
					value: ""
				};
				objects.label = column[key];
				objects.value = column[value];
				viewsData.push(objects);
			}
		})
		return viewsData;
	};
	this.getServicesDetailData = function(data, key, value) {
		var servicesData = [];
		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else if (column.hits == 0) {} else {
				var objects = {
					label: "",
					value: ""
				};
				objects.label = column[key];
				objects.value = column[value];
				servicesData.push(objects);
			}
		})
		return servicesData;
	};
	this.getToolsDetailData = function(data, key, value) {
		var toolsData = [];

		data.forEach(function(column) {
			if (column.hasOwnProperty("total")) {} else if (column.hits == 0) {} else {
				toolsData.push(column[value]);
			}
		})
		return toolsData;
	};

}]);




