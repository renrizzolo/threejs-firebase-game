'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('app', [
  'ngRoute',
  'firebase',
  'angular-toArrayFilter'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/game', { templateUrl: 'views/game.html', controller: 'GameCtrl' });
    $routeProvider.when('/login', { templateUrl: 'views/login.html', controller: 'LoginCtrl' });
  	$routeProvider.otherwise({redirectTo: '/login'});
}])
.run();
// array filter
angular.module('angular-toArrayFilter', [])
.filter('toArray', function () {
  return function (obj, addKey) {
    if (!angular.isObject(obj)) return obj;
    if ( addKey === false ) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    } else {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      });
    }
  };
});



app.factory('soundcloud', ['$http',
    function ($http) {
     
      var clientid = 'a7c99e975fa37c393cb1a6d89d5c1e0b';
      var track = '226389239';
      var url = '//api.soundcloud.com/tracks/';

  return {
            'get': function(latestTrack) {

              var trackUrl = url+latestTrack+'.json';

              var config = {
                          'params': {
                              'client_id': clientid,
                              'callback': 'JSON_CALLBACK'
                          }
                      };
                          return $http.jsonp(trackUrl, config);

        }
      };


    }]);
