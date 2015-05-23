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
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'hc.ngEcs'
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
  });
