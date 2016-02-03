app.service('rootURL', function(){
	this.url = {
		"baseURL": "http://115.186.132.18:8080/TI/",
		"DjangoURL": "http://115.186.132.19:8008/",
	};
	

	this.jsonURL = {
		"baseURL": "http://172.20.16.57/",
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
						  fillOpacity: 0.5
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
});
	

app.service('crudSrv', function($http){
    this.getResults = function(url, success, error){
		$http.get(url).success(function(data, status){
			success(data, status);
		}).error(function(data, status){
			error(data, status);
		});
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





