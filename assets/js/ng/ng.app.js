(function() {
   'use strict';

   angular
      .module('smartApp', [
         'ngRoute',
         'UserApp',
         'ui.bootstrap',
         'ui.router',
         'app.controllers',
         'app.main',
         'app.navigation',
         'app.localize',
         'app.activity',
         'app.smartui',
         'apura.controllers.dashboard',
         'apura.controllers.fileupload',
         'apura.controllers.lote',
         'apura.controllers.selic',
         'apura.controllers.apuracao'
      ])
      .config(['$stateProvider', '$urlRouterProvider', '$provide', function ($stateProvider, $urlRouterProvider, $provide) {

         $urlRouterProvider
            .otherwise('/home/dashboard');

         $stateProvider
            .state('home', {
               url: "/home",
               abstract: true,
               templateUrl: "index.html",
               data: {
                  public: false
               }
            })
            .state('home.dasboard', {
               url: '/dashboard',
               templateUrl: 'views/dashboard.html',
               controller: 'DashBoardCtrl'
            })
            .state('home.upload', {
               url: '/upload',
               templateUrl: 'views/upload.html',
               controller: 'FileUploadCtrl',
               data: {
                  hasPermission: 'admin'
               }
            })
            .state('home.lote', {
               url: '/lote',
               templateUrl: 'views/lote.html',
               controller: 'LoteCtrl',
               data: {
                  hasPermission: 'admin'
               }
            })
            .state('home.selic', {
               url: '/selic',
               templateUrl: 'views/selic.html',
               controller: 'SelicCtrl',
               data: {
                  hasPermission: 'admin'
               }
            })
            .state('home.apuracao', {
               url: '/apuracao',
               templateUrl: 'views/apuracao.html',
               controller: 'ApuracaoCtrl',
               data: {
                  hasPermission: 'admin'
               }
            })
            .state('home.detalhe', {
               url: '/detalhe/:id',
               templateUrl: 'views/detalhe.html',
               controller: 'ApuracaoDetailCtrl',
               data: {
                  hasPermission: 'admin'
               }
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
            .state('auth.verify_email', {
               url: '/verify-email',
               templateUrl: 'views/verify-email.html',
               data:  {
                  verify_email: true
               }
            })
            .state('auth.forgotpassword', {
               url: '/forgot-password',
               templateUrl: 'views/forgotpassword.html'
            })
            .state('auth.setpassword', {
               url: '/set-password',
               templateUrl: 'views/set-password.html',
               data:  {
                  set_password: true
               }
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
         user.init({
            appId: '53cee64a3d39e',
            heartbeatInterval: 0
         });
      }]);
})();


