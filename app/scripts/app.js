/* global angular */
'use strict';

/**
 * @ngdoc overview
 * @name angularEcsPongApp
 * @description
 * # angularEcsPongApp
 *
 * Main module of the application.
 */
angular
  .module('angularEcsFlapApp', [
    // 'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngCookies',
    'hc.ngEcs',
    'ngEcs.dom',
    'ngEcs.FPSMeter'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('isMobile', function ($window) {
    return $window.innerWidth < 768;
  });
