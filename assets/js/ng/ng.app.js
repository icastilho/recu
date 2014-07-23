var smartApp = angular.module('smartApp', [
  	'ngRoute',
    'UserApp',
  	'ui.bootstrap',
  	'plunker',
  	'app.controllers',
  	'app.demoControllers',
  	'app.main',
  	'app.navigation',
  	'app.localize',
  	'app.activity',
  	'app.smartui',
    'apura.controllers.fileupload',
    'apura.controllers.lote',
]);

smartApp.config(['$routeProvider', '$provide', function($routeProvider, $provide) {
	$routeProvider
		.when('/', {
			redirectTo: '/dashboard'
		})

		/* We are loading our views dynamically by passing arguments to the location url */

    .when('/login', {templateUrl: '/login.html', login: true})
    .when('/signup', {templateUrl: '/register.html', public: true})
    .when('/forgot-password', {templateUrl: '/forgotpassword.html', public: true})

		.when('/:page', {
			templateUrl: function($routeParams) {
        if ($routeParams.page === 'login')
          return '/login.html';
        else
          return '/index.html';
			},
			controller: 'PageViewController',
      public: false
		})
		.when('/:page/:child*', {
			templateUrl: function($routeParams) {
        if ($routeParams.page === 'login')
          return '/login.html';
        else
          return '/index.html';
			},
			controller: 'PageViewController',
      public: false
		})
		.otherwise({
			redirectTo: '/dashboard'
		});

	// with this, you can use $log('Message') same as $log.info('Message');
	$provide.decorator('$log', ['$delegate',
	function($delegate) {
		// create a new function to be returned below as the $log service (instead of the $delegate)
		function logger() {
			// if $log fn is called directly, default to "info" message
			logger.info.apply(logger, arguments);
		}

		// add all the $log props into our new logger fn
		angular.extend(logger, $delegate);
		return logger;
	}]); 

}]);

smartApp.run(['$rootScope', 'settings', 'user', function($rootScope, settings, user) {
	settings.currentLang = settings.languages[0]; // en
  user.init({ appId: '53cee64a3d39e' });
}])