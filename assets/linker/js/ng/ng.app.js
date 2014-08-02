angular
   .module('smartApp', [
      'ngRoute',
      'UserApp',
      'ui.bootstrap',
      'ui.router',
      'app.controllers',
      'app.demoControllers',
      'app.main',
      'app.navigation',
      'app.localize',
      'app.activity',
      'app.smartui',
      'apura.controllers.fileupload',
      'apura.controllers.lote'
//      'apura.controllers.selic'
   ])
   .config(['$stateProvider', '$urlRouterProvider', '$provide', function ($stateProvider, $urlRouterProvider, $provide) {

      $urlRouterProvider
         .otherwise('/home/upload');

      $stateProvider
         .state('home', {
            url: "/home",
            abstract: true,
            templateUrl: "index.html",
            data: {
               public: false
            }
         })
         .state('home.upload', {
            url: '/upload',
            templateUrl: 'views/upload.html',
            controller: 'FileUploadCtrl'
         })
         .state('home.lote', {
            url: '/lote',
            templateUrl: 'views/lote.html',
            controller: 'LoteCtrl'
         })
          .state('home.selic', {
              url: '/selic',
              templateUrl: 'views/selic.html',
              controller: 'SelicCtrl'
          })
         .state('auth', {
            url: "/auth",
            abstract: true,
            templateUrl: "auth.html",
            data: {
               public: true
            }
         })
         .state('auth.signup', {
            url: '/signup',
            templateUrl: 'views/register.html'
         })
         .state('auth.forgotpassword', {
            url: '/forgot-password',
            templateUrl: 'views/forgotpassword.html'
         })
         .state('auth.login', {
            url: '/login',
            templateUrl: 'views/login.html',
            data: {
               login: true
            }
         });

      // with this, you can use $log('Message') same as $log.info('Message');
      $provide.decorator('$log', ['$delegate',
         function ($delegate) {
            // create a new function to be returned below as the $log service (instead of the $delegate)
            function logger() {
               // if $log fn is called directly, default to "info" message
               logger.info.apply(logger, arguments);
            }

            // add all the $log props into our new logger fn
            angular.extend(logger, $delegate);
            return logger;
         }]);

   }])
   .run(['$rootScope', 'settings', 'user', function ($rootScope, settings, user) {
      settings.currentLang = settings.languages[0];
      user.init({ appId: '53cee64a3d39e' });
   }])