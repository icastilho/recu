var app = angular.module('recu', ['ngRoute', 'UserApp', 'recu.controllers'])
  .run(function(user) {
    user.init({ appId: '53bfe9bd1016c' });
  })
  .config(['$routeProvider',function($routeProvider) {
    $routeProvider
      .when('/login', {templateUrl: 'home/login.ejs', login: true})
      .when('/signup', {templateUrl: 'home/signup.ejs', public: true})
      .otherwise({redirectTo: '/'});
  }])
;
