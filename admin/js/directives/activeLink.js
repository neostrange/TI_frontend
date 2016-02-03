app.directive('activeLink', function($location, $rootScope) {
  return {
	restrict: 'A',
	link: function (scope, element, attrs) {
		var activeClass = attrs.activeLink;
		var path = element.find("a").attr("href");
		scope.locationZ = $location;
		scope.$watch('locationZ.path()', function (newPath) {
			// Split by "/" is used to ignore the second "/" so that in detailed view, the active item should not be inactive
			if(newPath != undefined){
				
				var newPathB = newPath.split("/");
				// Appending '#' for comparison, because the location returns /location, while href(path) returns #/location
				// if (path.toLowerCase() === "#"+newPath.toLowerCase()) {  //This code can be used if we dont need case sensitivity
				if (path === "#/"+newPathB[1]) { // This comparison is Case Sensitive
				  setTimeout( function (){
					element.addClass(activeClass);
				  });
				}else {
				  element.removeClass(activeClass);
				  setTimeout( function () {
					scope.$apply( function () {
					  scope.$eval(attrs.remove);
					});
				  });
				}
			}
	  });
	}
  }; 
});


app.directive('mydatepicker', function($location, $rootScope) {
 return {
    restrict: "E",
    scope:{
      ngModel: "=",
      dateOptions: "=",
      opened: "=",
    },
    link: function($scope, element, attrs) {
      $scope.open = function(event){
        console.log("open");
        event.preventDefault();
        event.stopPropagation();
        $scope.opened = true;
      };

      $scope.clear = function () {
        $scope.ngModel = null;
      };
    },
    templateUrl: 'views/datepicker.html'
  } 
});

app.directive('menuToggle', function(menuItemSrv, $compile) {
  return {
	restrict: 'A',
	link: function (scope, element, attrs) {
		console.log(attrs);
		var menuList = menuItemSrv.getMenuList[attrs.menuToggle];
		console.log(menuList);
		var itemsToAppend = "";
		menuList.forEach(function(item, i){
			itemsToAppend += "<li active-link='active' class='sub_sec'><a href="+item.link +">"+ item.title+"</a></li>";
		});
		
		console.log(itemsToAppend);
		element.append(itemsToAppend);
		$compile(element.find("li"))(scope);
	}
  }; 
});

app.directive('menu', function($compile, $rootScope, $route) {
  return {
	restrict: 'A',
	link: function (scope, element, attrs) {
		console.log("heloo");
				
		
		$("#toggle-btn").click(function(e){
        e.preventDefault();
		$("#toggle-btn").toggleClass("toggle-btn");
       $("#wrapper").toggleClass("toggled");
		});
	
	}
  }; 
});


app.directive('d3Bars', function($compile, $rootScope, $window) {
  return {
	restrict: 'EA',
	scope:{
		vals:"=" 
	},
	
	link: function (scope, elem, attrs) {
			console.log(elem);
			console.log(attrs);
			
			/*
			var map = new Datamap({
        element: document.getElementById('container'),
		responsive:true,
        fills: {
            defaultFill: 'rgba(23,48,210,0.9)' //any hex, color name or rgb/rgba value
        }
    })
	 d3.select(window).on('resize', function() {
                    map.resize();
                });
	
	*/
	
			
    // setup default min/max timer range for random draw
    attack_min = 100 ;
    attack_max = 2000 ;

    // add/change the attack types here
    attack_type = [ "any port scan in a storm", "ssh brutish force", "Thought Leader Tweet",
                    "SYN FLOOD BA-BY", "Spotty", "Heartbleed Hotel", "Po_ODLE", "Sharknado",
                    "CORGI Attack", "Ping of DOOM", "Conficker", "Goldfinger", "SANDPAPER",
                    "SNAILshock", "Spaghetti RAT", "Driduplex" ] ;

    // gotta add types here if you add more sounds (or delete them)

    audio_type = [ "starwars", "tng", "b5", "wargames", "pew", "galaga" ]

    // need this to more easily grab URI query parameters
    $.extend({
      getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
        }
        return vars;
      },
      getUrlVar: function(name){
        return $.getUrlVars()[name];
      }
    });

    // here's where we deal with parameters
    // try to grab them, see if they exist, make changes to defaults if they do

    var bad_day = $.getUrlVar('bad_day');
    var org_name = $.getUrlVar('org_name');
    var chatt_mode = $.getUrlVar('chatt_mode');
    var china_mode = $.getUrlVar('china_mode');
    var dprk_mode = $.getUrlVar('dprk_mode');
    var employee_mode = $.getUrlVar('employee_mode');
    var employee_fname = $.getUrlVar('employee_fname');
    var employee_lname = $.getUrlVar('employee_lname');
    var origin = $.getUrlVar('origin');
    var random_mode = $.getUrlVar('random_mode');
    var tng = $.getUrlVar('tng');
    var wargames = $.getUrlVar('wargames');
    var b5 = $.getUrlVar('b5');
    var nofx = $.getUrlVar('nofx');
    var pew = $.getUrlVar('pew');
    var allfx = $.getUrlVar('allfx')
    var galaga = $.getUrlVar('galaga')
    var drill_mode = $.getUrlVar("drill_mode")
    var in_lat = $.getUrlVar("lat")
    var in_lon = $.getUrlVar("lon")
    var destination = $.getUrlVar("destination")
    var greenattacks = $.getUrlVar("greenattacks")
    var redattacks = $.getUrlVar("redattacks")

    snd_id = "starwars" ;
    if (typeof tng !== 'undefined') { snd_id = "tng" ; }
    if (typeof b5 !== 'undefined') { snd_id = "b5" ; }
    if (typeof wargames !== 'undefined') { snd_id = "wargames" ; }
    if (typeof pew !== 'undefined') { snd_id = "pew" ; }
    if (typeof galaga !== 'undefined') { snd_id = "galaga" ; }

    if (typeof bad_day !== 'undefined') {
      attack_min=200;
      attack_max=200;
    }

    if (typeof org_name !== 'undefined') { $("#titlediv").text(decodeURI(org_name) + " IPew Attack Map").html() }

    // we maintain a fixed queue of "attacks" via this class
    function FixedQueue( size, initialValues ){
      initialValues = (initialValues || []);
      var queue = Array.apply( null, initialValues );
      queue.fixedSize = size;
      queue.push = FixedQueue.push;
      queue.splice = FixedQueue.splice;
      queue.unshift = FixedQueue.unshift;
      FixedQueue.trimTail.call( queue );
      return( queue );
    }

    FixedQueue.trimHead = function(){
      if (this.length <= this.fixedSize){ return; }
      Array.prototype.splice.call( this, 0, (this.length - this.fixedSize) );
    };

    FixedQueue.trimTail = function(){
      if (this.length <= this.fixedSize) { return; }
      Array.prototype.splice.call( this, this.fixedSize, (this.length - this.fixedSize)
      );
    };

    FixedQueue.wrapMethod = function( methodName, trimMethod ){
      var wrapper = function(){
        var method = Array.prototype[ methodName ];
        var result = method.apply( this, arguments );
        trimMethod.call( this );
        return( result );
      };
      return( wrapper );
    };

    FixedQueue.push = FixedQueue.wrapMethod( "push", FixedQueue.trimHead );
    FixedQueue.splice = FixedQueue.wrapMethod( "splice", FixedQueue.trimTail );
    FixedQueue.unshift = FixedQueue.wrapMethod( "unshift", FixedQueue.trimTail );

    var rand = function(min, max) {
        return Math.random() * (max - min) + min;
    };

    var getRandomCountry = function(countries, weight) {

        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });

        var random_num = rand(0, total_weight);
        var weight_sum = 0;

        for (var i = 0; i < countries.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);

            if (random_num <= weight_sum) {
                return countries[i];
            }
        }

    };

    // need to make this dynamic since it's approximated from sources

    var countries = [9,22,29,49,56,58,78,82,102,117,139,176,186] ;
    var weight = [0.000,0.001,0.004,0.008,0.009,0.037,0.181,0.002,0.000,0.415,0.006,0.075,0.088];

    // the fun begins!
    //
    // pretty simple setup ->
    // * make base Datamap
    // * setup timers to add random events to a queue
    // * update the Datamap

    var map = new Datamap({

        scope: 'world',
		responsive:true,
        element: document.getElementById('container'),
        // change the projection to something else only if you have absolutely no cartographic sense
        fills: { defaultFill: 'black', },
        geographyConfig: {
          dataUrl: null,
          hideAntarctica: true,
          borderWidth: 0.75,
          borderColor: '#4393c3',
          popupTemplate: function(geography, data) {
            return '<div class="hoverinfo" style="color:white;background:black">' +
                   geography.properties.name + '</div>';
          },
          popupOnHover: true,
          highlightOnHover: false,
          highlightFillColor: 'black',
          highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
          highlightBorderWidth: 2
        },

      })

	  
	   scope.$watch('vals', function(value) {
             console.log(value);
			 var neww = value;
			 if(neww != undefined){
				
				alert(JSON.stringify(neww));
				var hit = { origin : { latitude: +neww.lat, longitude: +neww.longs }, destination : { latitude: +neww.affected.lat, longitude: +neww.affected.longs } };
				var col = 'red';
				hi.push(hit);
           map.arc(hi, {strokeWidth: 2, strokeColor: col});

           // add boom to the bubbles queue

           boom.push( { radius: 7, latitude: +neww.affected.lat, longitude: +neww.affected.longs,
                        fillOpacity: 0.5, attk: neww.name} );
           map.bubbles(boom, {
                popupTemplate: function(geo, data) {
                  return '<div class="hoverinfo">' + neww.type + '</div>';
                }
            });
			
			}
          
		  });
	  
	  
	  var hi = [];
			scope.$watch('vals', function (neww, old) {
			console.log(neww);
			if(neww != undefined){
				
				alert(JSON.stringify(neww));
				var hit = { origin : { latitude: +neww.lat, longitude: +neww.longs }, destination : { latitude: +neww.affected.lat, longitude: +neww.affected.longs } };
				var col = 'red';
				hi.push(hit);
           map.arc(hi, {strokeWidth: 2, strokeColor: col});

           // add boom to the bubbles queue

           boom.push( { radius: 7, latitude: +neww.affected.lat, longitude: +neww.affected.longs,
                        fillOpacity: 0.5, attk: neww.name} );
           map.bubbles(boom, {
                popupTemplate: function(geo, data) {
                  return '<div class="hoverinfo">' + neww.type + '</div>';
                }
            });
			
			}
			}, true);
			
		
	  
    // we read in a modified file of all country centers
    var centers = [] ;
    d3.tsv("../src/json/country_centroids_primary.csv", function(data) { centers = data; });
    d3.csv("../src/json/samplatlong.csv", function(data) { slatlong = data; });
    d3.csv("../src/json/cnlatlong.csv", function(data) { cnlatlong = data; });

    // setup structures for the "hits" (arcs)
    // and circle booms

    var hits = FixedQueue( 7, [  ] );
    var boom = FixedQueue( 7, [  ] );

    // we need random numbers and also a way to build random ip addresses
    function getRandomInt(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}
    function getOctet() {return Math.round(Math.random()*255);}
    function randomIP () { return(getOctet() + '.' + getOctet() + '.' + getOctet() + '.' + getOctet()); }
    function getStroke() {return Math.round(Math.random()*100);}
    function getDestination() {return Math.round(Math.random()*100);}

    // doing this a bit fancy for a hack, but it makes it
    // easier to group code functions together and have variables
    // out of global scope
    var attacks = {

        interval: getRandomInt(attack_min, attack_max),

        init: function(){
           setTimeout(
               jQuery.proxy(this.getData, this),
               this.interval
           );
        },

       getData: function() {

           var self = this;

           if (typeof random_mode !== 'undefined') { Math.floor((Math.random() * slatlong.length)); }

           dst = Math.floor((Math.random() * slatlong.length));
           src = Math.floor((Math.random() * slatlong.length));

           if ((dst == src)) {
            dst = src + 1 ;
            if (dst > slatlong.length-1) { dst = src - 1 }
           }

           if (typeof allfx !== 'undefined') {
           //  snd_id = audio_type[Math.floor((Math.random() * audio_type.length))];
           }
           // no guarantee of sound playing w/o the load - stupid browsers
           if (typeof nofx === 'undefined') {
            // document.getElementById(snd_id).load();
            // document.getElementById(snd_id).play();
           }

           // add hit to the arc queue
           // use strokeColor to set arc line color

           var srclat = slatlong[src].lat;
           var srclong = slatlong[src].long;
           var dstlat = slatlong[dst].lat;
           var dstlong = slatlong[dst].long;
           which_attack = attack_type[Math.floor((Math.random() * attack_type.length))];
           var srccountry = slatlong[src]["country"];
           // "Hi, Mandiant!!"
           if (typeof china_mode !== 'undefined') {
             srclat = cnlatlong[src].lat;
             srclong = cnlatlong[src].long;
             if (cnlatlong[src].country=="chn") { which_attack = "ZOMGOSH CHINA!!!!!!"; }
             srccountry = cnlatlong[src]["country"];
           }
           // "Hi, Kim Jong!"
           else if (typeof dprk_mode !== 'undefined') {
             srclat = 39.0194;
             srclong = 125.7381;
             which_attack = "ZOMG NORTH KOREAZ!!!";
             srccountry = "kp";
           }
           // source is always Chattanooga if chatt_mode is set
           // "Hi ThreatStream!!" http://www.csoonline.com/article/2689609/network-security/threat-intelligence-firm-mistakes-research-for-nation-state-attack.html
           else if (typeof chatt_mode !== 'undefined') {
             srclat = 35.0456297;
             srclong = -85.30968;
             which_attack = "OMG NATION STATE CHATTANOOGA!!!";
             srccountry = "usa";
           }
           // blame a former employee
           else if (typeof employee_mode !== 'undefined') {
             if (typeof in_lat !== 'undefined' && typeof in_lon !== 'undefined') {
               srclat = in_lat;
               srclong = in_lon;
             }
             which_attack = "Former employee attack"
             if (typeof employee_fname !== 'undefined' && typeof employee_lname !== 'undefined') {
               which_attack += ":" + employee_fname + " " + employee_lname;
             }
             srccountry = "usa";
           }

           // Specify a country
           else if (typeof origin !== 'undefined') {
             srccountry = origin.toUpperCase();
             var center_id = 0;
             for (i = 0; i < centers.length; i ++) {
               center_id = i;
               if (centers[i].FIPS10 === srccountry) {
                break;
               }
             }

             srccountry = origin.toLowerCase();
             srclat = centers[center_id].LAT;
             srclong = centers[center_id].LONG;
           }
           
           // Specify a destination country
           if (typeof destination !== 'undefined' && getDestination() < 80) {
             dstcountry = destination.toUpperCase();
             var center_id = 0;
             for (i = 0; i < centers.length; i ++) {
               center_id = i;
               if (centers[i].FIPS10 === dstcountry) {
                break;
               }
             }

             dstcountry = destination.toLowerCase();
             attackdiv_slatlong = dstcountry;
             dstlat = centers[center_id].LAT;
             dstlong = centers[center_id].LONG;
           }
           else {
            attackdiv_slatlong = slatlong[dst]["country"];
           }

           // Specify attack color
           if (typeof greenattacks !== 'undefined') {
             strokeColor = 'green';
           }
           else if (typeof redattacks !== 'undefined') {
             strokeColor = 'red';
           }
           else {
             if (getStroke() < 70) {
               strokeColor = 'green';
             }
             else {
               strokeColor = 'white';
             }
           }

           if (typeof drill_mode != 'undefined') {

              dstlat = in_lat
              dstlong = in_lon
           }

           hits.push( { origin : { latitude: +srclat, longitude: +srclong },
                        destination : { latitude: +dstlat, longitude: +dstlong } } );
           map.arc(hits, {strokeWidth: 2, strokeColor: strokeColor});

           // add boom to the bubbles queue

           boom.push( { radius: 7, latitude: +dstlat, longitude: +dstlong,
                        fillOpacity: 0.5, attk: which_attack} );
           map.bubbles(boom, {
                popupTemplate: function(geo, data) {
                  return '<div class="hoverinfo">' + data.attk + '</div>';
                }
            });

           // update the scrolling attack div
           $('#attackdiv').append(srccountry + " (" + randomIP() + ") " +
                                  " <span style='color:red'>attacks</span> " +
                                  attackdiv_slatlong+  " (" + randomIP() + ") " +
                                  " <span style='color:steelblue'>(" + which_attack + ")</span> " +
                                  "<br/>");
           $('#attackdiv').animate({scrollTop: $('#attackdiv').prop("scrollHeight")}, 500);

           // pick a new random time and start the timer again!
           this.interval = getRandomInt(attack_min, attack_max);
           this.init() ;
       },

    };

    // start the ball rolling!
    attacks.init();

    // lazy-dude's responsive window
    d3.select(window).on('resize', function() { location.reload(); });
	 d3.select(window).on('resize', function() {
                    map.resize();
                });
	}
  }; 
});



app.directive('d3Maps', function($compile, $rootScope, $window) {
  return {
	restrict: 'EA',
	scope:{
		vals:"=" 
	},
	link: function (scope, elem, attrs) {
			console.log(elem);
			console.log(attrs);
    var map = new Datamap({

        scope: 'world',
		responsive:true,
        element: elem[0],
        // change the projection to something else only if you have absolutely no cartographic sense
        fills: { 'defaultFill': '#DDDDDD' , 'malware': 'red' , 'probing': '#FFA07A' , 'web':'#19a9d5', 'ssh':'#141719' , 'sip':'#1a9c39', 'database':'#999'},
        geographyConfig: {
          dataUrl: null,
          hideAntarctica: true,
          borderWidth: 0.75,
          borderColor: '#4393c3',
          popupTemplate: function(geography, data) {
            return '<div class="hoverinfo" style="color:white;background:black">' +
                   geography.properties.name + '</div>';
          },
          popupOnHover: true,
          highlightOnHover: false,
          highlightFillColor: 'black',
          highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
          highlightBorderWidth: 2
        },
	});

		
	
			var dot = [];
			scope.$watch('vals', function (neww, old) {
			 var boom = [];	
			  var col = '';
			  var fill;
			 var hi = [];
			console.log(neww);
			if(neww != undefined){
				neww.forEach(function(elem){
					 
					if(elem.type == "malware"){
						col = '#f05050';
						fill = elem.type;
					}else if(elem.type == "probing"){
						col = '#FFA07A';
						fill = elem.type;
					}else if(elem.type == "web"){
						col = '#19a9d5';
						fill = elem.type;
					}else if(elem.type == "ssh"){
						col = '#141719';
						fill = elem.type;
					}else if(elem.type == "sip"){
						col = '#1a9c39';
						fill = elem.type;
					}else if(elem.type == "database"){
						col = '#999';
						fill = elem.type;
					}else{
					col = 'white';
				}
				
				
				var hit = { origin : { latitude: +elem.lat, longitude: +elem.longs }, destination : { latitude: +elem.affected.lat, longitude: +elem.affected.longs } };
				hi.push(hit);
				
				dot.push( { radius: 3, latitude: +elem.lat, longitude: +elem.longs, fillKey: fill,
                        fillOpacity: 0.5, attk:elem.name, IP:elem['Ip'], yeild: 50000, borderColor:col , animate:true});
						
				boom.push( { radius: 7, latitude: +elem.affected.lat, longitude: +elem.affected.longs,
                        fillOpacity: 0.5, attk: elem.name , IP:elem['Ip']});
					console.log(boom);
			});
				
			map.arc(hi, {strokeWidth: 3, strokeColor: col});   
           /*
		   map.bubbles(boom, {
                popupTemplate: function(geo, data) {
					console.log(boom);
					console.log(geo);
					console.log(data);
                    return ['<div class="hoverinfo"><strong>',
										'Attack By ' + data.attk +
										'</strong><strong>',
										' IP ' + data.IP,
										'</strong>',
										'</div>'].join('');
                }
            });
			*/
			
			 map.bubbles(dot, {
                popupTemplate: function(geo, data) {
					console.log(boom);
					console.log(geo);
					console.log(data);
                    return ['<div class="hoverinfo"><strong>',
										'Attack By ' + data.attk +
										'</strong><strong>',
										' IP ' + data.IP,
										'</strong>',
										'</div>'].join('');
                }
            });
			
			}
			}, true);
		

    // start the ball rolling!
   
    // lazy-dude's responsive window
    d3.select(window).on('resize', function() { location.reload(); });
	 d3.select(window).on('resize', function() {
                    map.resize();
                });


	}
  }; 
});

app.directive('dateTime', function(){
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel){
      if (!ngModel) {
        console.log('no model, returning');
        return;
      }
      
      element.bind('blur keyup change', function() {
        scope.$apply(read);
      });
      
      read();
      
      function read() {
        ngModel.$setViewValue(element.val());
      }
    }
  }
});

app.directive("newMap",function(){
	return{
		 restrict:'EA',
		 scope:{
				vals:"=" 
			},
			link:function(scope, element, attrs){
			function mapOptions(val) {
				console.log(val);
          return {
            element: element[0],
            responsive : true,
			scope: 'world',
				options: {
					 width:750,
					 staticGeoData : true,
					legendHeight: 200,
					legendwidth: 300					// optionally set the padding for the legend
				},fills: {
				 defaultFill: '#DDDDDD',
				 authorHasTraveledTo: "#fa0fa0"
				},
			data:{},
			geographyConfig: {
					highlighBorderColor: '#EAA9A8',
					highlighBorderWidth:3,
					popupTemplate:function(geo, data) {
						  console.log(geo.properties);
						  if(data != null){
							  return ['<div class="hoverinfo"><strong>',
								'Attacks ' + geo.properties.name,
								': ' + data.numberOfThings,
								'</strong></div>'].join('');
						  }else{
							  return ['<div class="hoverinfo"><strong>',
								'' + geo.properties.name,
								'</strong></div>'].join('');
							  return geo.properties.name;
						  }  
					}
			}
			};
			
        };
		
		scope.$watch('vals', function (neww, old) {
			console.log(neww);
			if(neww != undefined){
			var map = new Datamap(mapOptions(neww));
			map.updateChoropleth(neww);
			map.legend(neww);
		}},true);
		
		d3.select(window).on('resize', function() { location.reload(); });
		d3.select(window).on('resize', function() {
            map.resize();
        });	
		
		
		}
	}
});

app.directive('highDonut', function(){
  return {
    restrict: 'EA',
    link: function(scope, element, attrs, $timeout){
 		
		 $('#containers').highcharts({
        chart: {
            type: 'areaspline'
        },
        title: {
            text: 'Average fruit consumption during one week'
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 150,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
            categories: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            plotBands: [{ // visualize the weekend
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
        },
        yAxis: {
            title: {
                text: 'Fruit units'
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: ' units'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.5
            }
        },
        series: [{
            name: 'John',
            data: [3, 4, 3, 5, 4, 10, 12]
        }, {
            name: 'Jane',
            data: [1, 3, 4, 3, 3, 5, 4]
        }],
			func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
    });
		
		/*
      element.highcharts({
        chart: {
            type: 'pie',
			reflow: true,
            options3d: {
                enabled: true,
                alpha: 45
            }
        },
        title: {
            text: 'Contents'
        },
        plotOptions: {
            pie: {
                innerSize: 100,
                depth: 45
            }
        },
		credits: {
				enabled: false
			},
        series: [{
            name: 'Delivered amount',
            data: [
                ['Bananas', 8],
                ['Kiwi', 3],
                ['Mixed nuts', 1],
                ['Oranges', 6],
                ['Apples', 8],
                ['Pears', 4],
                ['Clementines', 4],
                ['Reddish (bag)', 1],
                ['Grapes (bunch)', 1]
            ]
        }],
		func: function(chart) {
				$timeout(function() {
					chart.reflow();
				}, 0);
			}
    });
      */
    }
  }
});


app.directive("scatterDot",function(crudSrv, rootURL, utilityMethods){
    return {
        restrict : 'E',
        replace : true,
        link : function(scope,elem,attrs){
          var data_url =  attrs.visdata;
          var height = 400;
          if(attrs.hasOwnProperty("height"))
          {
            height = attrs.height;
          }

          var left_pad = 100;
          if(attrs.hasOwnProperty("leftpadding"))
          {

            left_pad = attrs.leftpadding;
          }
      

          var element = elem[0];
          var container = d3.select(element);
          var clientwdith = container[0][0].offsetParent.clientWidth-60;
          var w = clientwdith,
              h = height,
              pad = 20,
              bottom_pad = 70;


              container.html("");
        var svg = container
        .append("svg")
        .attr("width", w)
        .attr("height", h);
        var tooltip = container
                    .append("div")
                    .attr("class","tooltip")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .text("");
var keys = [];
 var s_keys = [];
  var color=d3.scale.category10();
  console.log(color);
    
	  crudSrv.getResults(rootURL.url.baseURL + "sships/", function(data, status){

		 console.log(data);
		 data.forEach(function(d) {
				
            d.ip = d.ip;
            d.hits = +d.hits;
          keys.push(d.ip);
            s_keys.push(d.ip_country);  			
      });
		

    var onlyUnique = function(value, index, self) { 
      return self.indexOf(value) === index;
    }

  var unique = keys.filter(onlyUnique).sort(function(a,b){return b-a});
    var s_unique  = s_keys.filter(onlyUnique).sort(function(a,b){return b-a});
	console.log(s_unique);
  	console.log(left_pad);
	console.log(w-pad);
		
	var x = d3.scale.ordinal()
         .domain(s_unique)
         .rangePoints([left_pad, w-pad]);
		 
	var y = d3.scale.ordinal()
         .domain(unique)
       .rangePoints([pad,h-bottom_pad]);

  	var xAxis = d3.svg.axis().scale(x)
          .orient("bottom")
    
    var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
            /*.ticks(10)
            .tickFormat(function (d, i) {
              return unique[i];
            })*/;


    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, "+(h-bottom_pad)+")")
    .attr("id","xaxis")
    .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", clientwdith)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Local Systems");;
 
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate("+(left_pad-pad)+", 0)")
    .call(yAxis);

    svg.append("text")
    .attr("class", "loading")
    .text("Loading ...")
    .attr("x", function () { return w/2; })
    .attr("y", function () { return h/2-5; });

    var max_r = d3.max(data.map(
                       function (d) { return d.ip; })),
        r = d3.scale.linear()
            .domain([0, d3.max(data, function (d) { return d.hits; })])
            .range([0, 12]);
  
    var radius_calc = function(d){
        var rd = r(d.hits);
        if(rd < 2){
            rd +=2;
        }else{
            rd +=1;
        }

        return rd;
    }

  svg.selectAll("#xaxis")
        .selectAll(".tick")
        .selectAll("text")
         .attr("y", 0)
    .attr("x", -59)
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)")
    .style("text-anchor", "start");
  

     svg.selectAll(".loading").remove();
   svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .on("mouseover",function(d){
             var currentCircle = d3.select(this);
             var className = currentCircle.attr("class");
             svg.selectAll("."+className).attr("r", function(d){ console.log(d);return r(d.hits)+6;});
             tooltip.html("<b>Count:</b> "+d.hits)
             return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(){
            return tooltip
                    .style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout",function(){
             var className = d3.select(this).attr("class");
             svg.selectAll("."+className).attr("r", radius_calc);
            return tooltip.style("visibility", "hidden");
        })
    .attr("class", function(d){return "cs_"+d.ip.replace(/\./g,"-")})       
        .transition()
        .duration(800)
        
        .attr("cx", function (d) { return x(d.ip_country); })
        .attr("cy", function (d) { return y(d.ip); })
        .style("fill",function(d){return color(d.ip) })
        .attr("count",function(d){d.hits})    
        .attr("r", radius_calc) 
    });
}
}
});


app.directive("accountDetails",function(crudSrv){
  return  {
    restrict :'EA',
	 scope:{
			vals:"=" 
		},
    replace : true,
    link : function(scope,elem,attrs){
			var element = elem[0];
			var container = d3.select(element);

			var margin = {top: 2, right: 2, bottom: 2, left: 2},
			  clientwdith = attrs.width-60,
			  width = clientwdith - margin.left - margin.right,
			  height = attrs.height - margin.top - margin.bottom;
			var svg = container.append("svg")
				.attr("width", width)
				.attr("height", height);
			var color= d3.scale.category20();
			var force = d3.layout.force()
				.gravity(.05)
				.distance(50)
				.charge(-100)
				.size([width, height]);
				
			d3.select(window).on('resize', function() {
				x = window.innerWidth || e.clientWidth || g.clientWidth;
				y = window.innerHeight|| e.clientHeight|| g.clientHeight;
				svg.attr("width", x).attr("height", y);

			});		

scope.$watch('vals', function (neww, old) {
	console.log(neww, old);
	
	if(neww != undefined){
			var data = {};
				data.nodes = [];
				data.links = [];
				neww.forEach(function(elem){
					data.nodes.push({
						name:elem.malware,
						group:elem.hits
					});
				});
		 force
				.nodes(data.nodes)
				.links(data.links)
				.start();
		   var link = svg.selectAll(".link")
				 .data(data.links)
				 .enter().append("line")
				 .attr("class", "link");

		  var node = svg.selectAll(".node")
			  .data(data.nodes)
			.enter().append("g")
			  .attr("class", "node")
			  .call(force.drag);

			node.append("image")
			  .attr("xlink:href", "https://github.com/favicon.ico")
			  .attr("x", -8)
			  .attr("y", -8)
			  .attr("width", 20)
			  .attr("height", 26)
			.on('click', function(d){ 
			   console.log(d); 
			   scope.$apply(function(){
			//  $location.path("/detail/"+alarm_id+"/"+d.name)
			});
			}).
			on("mouseover", function(d)
			{
				 d3.select(this).transition()
           .duration(750)
           .attr("r", function (d) {return d.size + 10;});
       // locate node and append text; add class to faciliate deletion
				node.filter(function (o) {return o.index === d.index;})
				.append("text")
				.attr("class", "nodetext")
				.text(d.group)
			})
			.on("mouseout", function(d)
			{
				d3.select(this).transition()
           .duration(750)
           .attr("r", function (d) {return d.size;});
			// delete text based on class
			d3.selectAll(".nodetext").remove();
				
			});
		  node.append("text")
			  .attr("dx", 12)
			  .attr("dy", ".35em")
			  .text(function(d) { return d.name })
			.style("font-size", "20px") 
			.style("fill", function(d) { return color(d.name);});

		  force.on("tick", function() {
			link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		  });

			}
},true);
    }
  }
});