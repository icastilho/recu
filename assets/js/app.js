'use strict';


// Declare app level module which depends on filters, and services
angular.module('apura', [
  'ngRoute',
  'apura.filters',
  'apura.services',
  'apura.directives',
  'apura.controllers',
  'apura.controllers.fileupload',
  'UserApp'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', login: true});
  $routeProvider.when('/signup', {templateUrl: 'partials/signup.html', public: true});
  $routeProvider.when('/verify-email', {templateUrl: 'partials/verify-email.html', verify_email: true});
  $routeProvider.when('/reset-password', {templateUrl: 'partials/reset-password.html', public: true});
  $routeProvider.when('/set-password', {templateUrl: 'partials/set-password.html', set_password: true});
  $routeProvider.when('/upload', {templateUrl: 'views/upload.html', controller: 'FileUploadCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]).
run(function(user) {
  user.init({ appId: '53c13376ce73c' });
});
