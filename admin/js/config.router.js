'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams','$location', '$cookies','$window',
      function ($rootScope,   $state,   $stateParams, $location, $cookies, $window) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;  
		
			if($cookies['token'] == null || $cookies['token'] == undefined){
					$state.go("access.signin");
			}
		
			$rootScope.$on('$stateChangeStart', 
			function(event, toState, toParams, fromState, fromParams){ 
			// do something	
			});

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
				if($cookies['token'] == null || $cookies['token'] == undefined){
					$state.go("access.signin");
				}
			
		});
		
			$rootScope.online = navigator.onLine; 
                $window.addEventListener("offline", function () {
                  $rootScope.$apply(function() {
                    $rootScope.online = false;
					console.log("offline");
                    $rootScope.warning = "No internet connection";
                  });
                }, false);
                $window.addEventListener("online", function () {
                  $rootScope.$apply(function() {
                    $rootScope.online = true;
                    $rootScope.warning = "";
					console.log("online");
                  });
                }, false);
		
		
		$rootScope.$watch('online', function(newStatus){
				console.log(newStatus);
		});
		
     }]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider','$compileProvider',
      function ($stateProvider, $urlRouterProvider , $compileProvider) {
           $compileProvider.debugInfoEnabled(false);
          $urlRouterProvider
              .otherwise('/app/dashboard-v1');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html',
				  contoller:'MainCtrl'
              })
              .state('app.dashboard-v1', {
                  url: '/dashboard-v1',
                  templateUrl: 'tpl/app_dashboard_v1.html',
                  controller:'MainCtrl'
              })
              .state('app.dashboard-v2', {
                  url: '/dashboard-v2',
                  templateUrl: 'tpl/app_dashboard_v2.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/controllers/chart.js']);
                    }]
                  }
              })
			  
			  .state('app.situationalAwareness', {
                  url: '/situationalAwareness',
                  templateUrl: 'views/situational/situationalAwareness.html',
                  controller:'SituationalAwareness'
              })
			  
			   .state('app.advancedSearchForm', {
                url: '/advancedSearchForm',
                templateUrl : 'views/search/advancedSearchForm.html',
				controller:'advancedSearchCTRL'
              })
			  
			   .state('app.freeSearch', {
                url: '/freeSearch/:q',
                templateUrl : 'views/search/freeSearch.html',
				controller:'FreeSearchCTRL'
              })
			  
			  .state('app.globalThreat', {
				cache: false,
                url: '/globalThreat',
                templateUrl : 'views/map/globalThreatMap.html',
				controller : 'GlobalThreatCtrl',
				reload:true
              })
			  
			  .state('app.internalThreat', {
                url: '/internalThreat',
                templateUrl : 'views/map/internalThreatMap.html',
				controller : 'InternalThreatCtrl'
              })
			  
			  .state('app.internalThreatDetectedList', {
                url: '/dep/:ID',
                templateUrl : 'views/map/internalThreatsDetected.html',
				controller : 'InternalThreatsDetectedListCtrl'
              })
			  
			    .state('app.addInternalThreatForm', {
                url: '/addInternalThreatForm',
                templateUrl : 'views/map/addInternalThreatForm.html',
				resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/AddInternalThreatController.js'] );
                      }]
                  }
              })
			  
			   .state('app.listInternalThreats', {
                url: '/listInternalThreats',
                templateUrl : 'views/map/listInternalThreats.html',
				resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/AddInternalThreatController.js'] );
                      }]
                  }
              })
			  
			   .state('app.addSensorForm', {
                url: '/addSensorForm',
                templateUrl : 'views/addSensorForm.html',
				resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/AddInternalThreatController.js'] );
                      }]
                  }
              })
			  
			  .state('app.listAllSensors', {
                url: '/listAllSensors',
                templateUrl : 'views/listAllSensors.html',
				resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/AddInternalThreatController.js'] );
                      }]
                  }
              })
		 			  
			   .state('app.CountryIps', {
                url: '/CountryIps/:cName/cCode/:cCode',
                templateUrl : 'views/map/countryMap.html',
				resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/attackType.js'] );
                      }]
                  }
              })
			  
			   .state('app.activitySummary', {
                url: '/ip/:ip/attack/:attack',
                templateUrl : 'views/map/listActivityAttacks.html',
				controller: 'ActivitySummaryCTRL'
              })
			  
			  .state('app.Reconnaissance', {
                url: '/Reconnaissance/:country/attack/:attack',
                templateUrl : 'views/country_view/reconnaissanceMap.html',
				controller: 'ReconnaissanceCtrl'
              })
			  
			  .state('app.virusInfection', {
                url: '/virus/:country/attack/:attack',
                templateUrl : 'views/country_view/virusMap.html',
				controller: 'VirusCtrl'
              })
			  
			  
			  .state('app.hashMap', {
				abstract:true,
             url: '/country/:country/cCode/:cCode/hash/:hash',
                templateUrl : 'views/country_view/hashMap.html',
				controller: 'MainHashCtrl'
              })
			  
              .state('app.hashMap.list', {
                  url: '/inbox/{fold}',
                  templateUrl: 'views/country_view/hashSignature.html',
				  controller: 'MainHashCtrl'
				  
              })
			  
			  .state('app.showIp', {
                url: '/showIps/:ID/ip/:IP',
                templateUrl : 'views/map/ipMap.html',
				controller: 'DetailIpCtrl'
              })
			  
              .state('app.malware', {
                  url: '/malware',
                  template: '<div ui-view class="fade-in-up"></div>'
              })
			  
			   .state('app.malware.main', {
                url: '/aboutMalware',
                templateUrl : 'views/malware_attacks/main_malware_attacks.html',
				controller : ''
              })
			  
			  .state('app.malware.mpc', {
                url: '/probingCountries',
                templateUrl : 'views/malware_attacks/probing_countries.html',
				controller  : 'ProbingCountriesCtrl'
              })
			  .state('app.malware.mpcUniqueIp', {
                url: '/probCountriesUIP',
                templateUrl : 'views/malware_attacks/probing_countries_unique_ip.html',
				controller  : 'ProbingCountriesUniqueIPCtrl'
              })
			  
			   .state('app.malware.mpIP', {
                url: '/probingIP',
                templateUrl : 'views/malware_attacks/probing_ip.html',
				controller  : 'ProbingIPCtrl'
              })
			  
			  .state('app.malware.maIP', {
                url: '/attackingIP',
               templateUrl : 'views/malware_attacks/attacking_ip.html',
				controller  : 'AttackingIPCtrl'
              })
			  
			  .state('app.malware.mac', {
                url: '/attackingCountries',
                templateUrl : 'views/malware_attacks/attacking_countries.html',
				controller  : 'AttackingCountriesCtrl'
              })
			  
			  .state('app.malware.aIpFix', {
                url: '/attackingIPFix',
                templateUrl : 'views/malware_attacks/attacking_ip_fix.html',
				controller  : 'AttackingIPFixCtrl'
              })
			  
			   .state('app.malware.top_vul', {
                url: '/topVulnerabilities',
               templateUrl : 'views/malware_attacks/top_vulnerabilities.html',
				controller  : 'TopVulnerabilitiesCtrl'
              })
			  
			  .state('app.malware.mal_det', {
                url: '/detectedMalwares',
               templateUrl : 'views/malware_attacks/detected_malwares.html',
				controller  : 'DetectedMalwareCtrl'
              })
			  
			  .state('app.malware.cnc', {
                url: '/cncIP',
               templateUrl : 'views/malware_attacks/cnc_ip.html',
				controller  : 'CNCIPCtrl'
              })
			  
			  .state('app.malware.ap', {
				url: '/attackedProtocol',
				templateUrl : 'views/malware_attacks/attacked_protocol.html',
				controller  : 'AttackedProtocolCtrl'
              })
			 
			  /*
              
              
              .state('app.ui.grid', {
                  url: '/grid',
                  templateUrl: 'tpl/ui_grid.html'
              })
              .state('app.ui.widgets', {
                  url: '/widgets',
                  templateUrl: 'tpl/ui_widgets.html'
              })          
              .state('app.ui.bootstrap', {
                  url: '/bootstrap',
                  templateUrl: 'tpl/ui_bootstrap.html'
              })
              .state('app.ui.sortable', {
                  url: '/sortable',
                  templateUrl: 'tpl/ui_sortable.html'
              })
              .state('app.ui.portlet', {
                  url: '/portlet',
                  templateUrl: 'tpl/ui_portlet.html'
              })
              .state('app.ui.timeline', {
                  url: '/timeline',
                  templateUrl: 'tpl/ui_timeline.html'
              })
              .state('app.ui.tree', {
                  url: '/tree',
                  templateUrl: 'tpl/ui_tree.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load('angularBootstrapNavTree').then(
                              function(){
                                 return $ocLazyLoad.load('js/controllers/tree.js');
                              }
                          );
                        }
                      ]
                  }
              })
              .state('app.ui.toaster', {
                  url: '/toaster',
                  templateUrl: 'tpl/ui_toaster.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function(){
                                 return $ocLazyLoad.load('js/controllers/toaster.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.ui.jvectormap', {
                  url: '/jvectormap',
                  templateUrl: 'tpl/ui_jvectormap.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('js/controllers/vectormap.js');
                      }]
                  }
              })
              .state('app.ui.googlemap', {
                  url: '/googlemap',
                  templateUrl: 'tpl/ui_googlemap.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( [
                            'js/app/map/load-google-maps.js',
                            'js/app/map/ui-map.js',
                            'js/app/map/map.js'] ).then(
                              function(){
                                return loadGoogleMaps(); 
                              }
                            );
                      }]
                  }
              })
			  */
              .state('app.chart', {
                  url: '/chart',
                  templateUrl: 'tpl/ui_chart.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad){
                          return uiLoad.load('js/controllers/chart.js');
                      }]
                  }
              })
              // table
              .state('app.sip', {
                  url: '/table',
                  template: '<div ui-view></div>'
              })
			 
			 .state('app.sip.main', {
                url: '/aboutSip',
                templateUrl : 'views/sip_attacks/main_sip_attacks.html',
				controller  : ''
              })
			 
			 .state('app.sip.attacks', {
                url: '/sipAtck',
                templateUrl : 'views/sip_attacks/sip_attacks.html',
				controller  : 'SIPAttacksCtrl'
              })
			  
              .state('app.sip.rsa', {
                url: '/sipRegistrarServerAtck',
                templateUrl : 'views/sip_attacks/sip_registrar_server_attacks.html',
				controller  : 'SIPRegistrarAttacksCtrl'
              })
			   .state('app.sip.ofa', {
                url: '/sipOptionFloodingAtck',
                templateUrl : 'views/sip_attacks/sip_option_flooding_attacks.html',
				controller  : 'SIPOptionFloodingAttacksCtrl'
              })
			  
              .state('app.sip.fpsa', {
					url: '/sipFloodingProxyAtck',
                  	templateUrl : 'views/sip_attacks/sip_flooding_proxy_attacks.html',
					controller  : 'SIPFloodingProxyAttacksCtrl'
              })
			  
              .state('app.sip.tool', {
					url: '/sipTools',
                  	templateUrl : 'views/sip_attacks/sip_tools.html',
					controller  : 'SIPToolsCtrl'
              })
             
			 
			  .state('app.dashboardAttack', {
                url: '/dashboardAttack/:type/counts/:counts',
                templateUrl : 'views/dashboard_attackedInfo.html',
				controller  : 'DashBoardAttackInfo'
              })
			  
			   .state('app.testDashBoard', {
                  url: '/testDashBoard/:type/counts/:counts',
                templateUrl : 'views/testDashBoard.html',
				controller  : 'TestDashBoard'
              })
			 
              // form
              .state('app.web', {
                  url: '/form',
                  template: '<div ui-view class="fade-in"></div>'
              })
			  
			  .state('app.web.main', {
                  url: '/aboutWeb',
                  templateUrl: 'views/web_attacks/main_web_attacks.html',
				  controller:''
              })
			  
              .state('app.web.tfc', {
                  url: '/topFewCountries',
                  templateUrl: 'views/web_attacks/top_few_countries.html',
				  controller:'TopFewCountriesCtrl'
              })
              .state('app.web.tfip', {
                  url: '/topFewIPs',
                  templateUrl : 'views/web_attacks/top_few_ip_addresses.html',
					controller  : 'TopFewIPsCtrl'
              })
              .state('app.web.tfwa', {
                  url: '/topFewWebAttacks',
                  templateUrl : 'views/web_attacks/top_few_web_attacks.html',
				  controller  : 'TopFewWebAttacksCtrl'
              })
			  
			  .state('app.web.webSeverity',{
                  url: '/topFewWebSeverities',
                  templateUrl : 'views/web_attacks/top_few_web_severties.html',
				  controller  : 'TopFewWebSevertiesCtrl'
              })
              
              .state('app.form.imagecrop', {
                  url: '/imagecrop',
                  templateUrl: 'tpl/form_imagecrop.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('ngImgCrop').then(
                              function(){
                                 return $ocLazyLoad.load('js/controllers/imgcrop.js');
                              }
                          );
                      }]
                  }
              })
              
              // pages
              .state('app.brute', {
                  url: '/page',
                  template: '<div ui-view class="fade-in-down"></div>'
              })
			  
			  .state('app.brute.main', {
                  url: '/aboutBrute',
                  templateUrl : 'views/brute_force_attacks/main_brute_force_attacks.html',
				  controller  : 'BruteForceCTRL'
              })
			  
              .state('app.brute.mu', {
                  url: '/mostUsedUsernames',
                  templateUrl : 'views/brute_force_attacks/used_usernames.html',
				  controller  : 'MostUsedUsernameCtrl'
              })
              .state('app.brute.mp', {
                  url: '/mostUsedPswd',
                  templateUrl : 'views/brute_force_attacks/used_passwords.html',
				  controller  : 'MostUsedPasswordCtrl'
              })
              .state('app.brute.ipssh', {
                  url: '/topIPsSSHAtck',
                  templateUrl : 'views/brute_force_attacks/conducting_ssh_attacks.html',
				  controller  : 'ConductingSSHAttacksCtrl'
              })
              .state('app.brute.tufssh', {
                  url: '/toolsSSHAtck',
                  templateUrl : 'views/brute_force_attacks/ssh_tools.html',
				  controller  : 'SSHToolsCtrl'
              })
			  
			  
			    .state('app.pdfReport', {
                  url: '/pdfReport',
                  templateUrl : 'views/pdf/pdfReports.html',
				  controller  : 'MainReportCtrl'
              })
			  
			    .state('app.csvReport', {
                  url: '/csvReport',
                  templateUrl : 'views/pdf/csvReports.html',
				  controller  : 'MainReportCtrl'
              })
			  
			  .state('app.searchIp', {
                url: '/IP/:ID',
                templateUrl : 'views/map/ip_lists.html',
				controller: 'AppSearchCtrl'
              })
              
              // others
              .state('lockme', {
                  url: '/lockme',
                  templateUrl: 'tpl/page_lockme.html'
              })
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              .state('access.signin',{
                  url: '/signin',
                  templateUrl: 'views/login/page_signin.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signin.js'] );
                      }]
                  }
              })
              .state('access.signup', {
                  url: '/signup',
                  templateUrl: 'tpl/page_signup.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signup.js'] );
                      }]
                  }
              })
              .state('access.forgotpwd', {
                  url: '/forgotpwd',
                  templateUrl: 'tpl/page_forgotpwd.html'
              })
              .state('access.404', {
                  url: '/404',
                  templateUrl: 'tpl/page_404.html'
              })

              // fullCalendar
              .state('app.calendar', {
                  url: '/calendar',
                  templateUrl: 'tpl/app_calendar.html',
                  // use resolve to load other dependences
                  resolve: {
                      deps: ['$ocLazyLoad', 'uiLoad',
                        function( $ocLazyLoad, uiLoad ){
                          return uiLoad.load(
                            ['vendor/jquery/fullcalendar/fullcalendar.css',
                              'vendor/jquery/fullcalendar/theme.css',
                              'vendor/jquery/jquery-ui-1.10.3.custom.min.js',
                              'vendor/libs/moment.min.js',
                              'vendor/jquery/fullcalendar/fullcalendar.min.js',
                              'js/app/calendar/calendar.js']
                          ).then(
                            function(){
                              return $ocLazyLoad.load('ui.calendar');
                            }
                          )
                      }]
                  }
              })

              // mail
              .state('app.mail', {
                  abstract: true,
                  url: '/mail',
                  templateUrl: 'tpl/mail.html',
                  // use resolve to load other dependences
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/app/mail/mail.js',
                                               'js/app/mail/mail-service.js',
                                               'vendor/libs/moment.min.js'] );
                      }]
                  }
              })
              .state('app.mail.list', {
                  url: '/inbox/{fold}',
                  templateUrl: 'tpl/mail.list.html'
              })
              .state('app.mail.detail', {
                  url: '/{mailId:[0-9]{1,4}}',
                  templateUrl: 'tpl/mail.detail.html'
              })
              .state('app.mail.compose', {
                  url: '/compose',
                  templateUrl: 'tpl/mail.new.html'
              })

              .state('layout', {
                  abstract: true,
                  url: '/layout',
                  templateUrl: 'tpl/layout.html'
              })
              .state('layout.fullwidth', {
                  url: '/fullwidth',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_fullwidth.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_fullwidth.html'
                      }
                  },
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/vectormap.js'] );
                      }]
                  }
              })
              .state('layout.mobile', {
                  url: '/mobile',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_mobile.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_mobile.html'
                      }
                  }
              })
              .state('layout.app', {
                  url: '/app',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_app.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_fullwidth.html'
                      }
                  },
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/tab.js'] );
                      }]
                  }
              })
              .state('apps', {
                  abstract: true,
                  url: '/apps',
                  templateUrl: 'tpl/layout.html'
              })
              .state('apps.note', {
                  url: '/note',
                  templateUrl: 'tpl/apps_note.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/app/note/note.js',
                                               'vendor/libs/moment.min.js'] );
                      }]
                  }
              })
              .state('apps.contact', {
                  url: '/contact',
                  templateUrl: 'tpl/apps_contact.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/app/contact/contact.js'] );
                      }]
                  }
              })
              .state('app.weather', {
                  url: '/weather',
                  templateUrl: 'tpl/apps_weather.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load(
                              {
                                  name: 'angular-skycons',
                                  files: ['js/app/weather/skycons.js',
                                          'vendor/libs/moment.min.js', 
                                          'js/app/weather/angular-skycons.js',
                                          'js/app/weather/ctrl.js' ] 
                              }
                          );
                      }]
                  }
              })
              .state('music', {
                  url: '/music',
                  templateUrl: 'tpl/music.html',
                  controller: 'MusicCtrl',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load([
                            'com.2fdevs.videogular', 
                            'com.2fdevs.videogular.plugins.controls', 
                            'com.2fdevs.videogular.plugins.overlayplay',
                            'com.2fdevs.videogular.plugins.poster',
                            'com.2fdevs.videogular.plugins.buffering',
                            'js/app/music/ctrl.js', 
                            'js/app/music/theme.css'
                          ]);
                      }]
                  }
              })
                .state('music.home', {
                    url: '/home',
                    templateUrl: 'tpl/music.home.html'
                })
                .state('music.genres', {
                    url: '/genres',
                    templateUrl: 'tpl/music.genres.html'
                })
                .state('music.detail', {
                    url: '/detail',
                    templateUrl: 'tpl/music.detail.html'
                })
                .state('music.mtv', {
                    url: '/mtv',
                    templateUrl: 'tpl/music.mtv.html'
                })
                .state('music.mtvdetail', {
                    url: '/mtvdetail',
                    templateUrl: 'tpl/music.mtv.detail.html'
                })
                .state('music.playlist', {
                    url: '/playlist/{fold}',
                    templateUrl: 'tpl/music.playlist.html'
                })
      }
    ]
  );