/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
//   'styles/**/*.css'

   <!-- Basic Styles -->
   'css/bootstrap.min.css',
   'css/font-awesome.min.css',

   <!-- SmartAdmin Styles : Please note (smartadmin-production.css) was created using LESS variables -->
   'css/smartadmin-production.min.css',
   'css/smartadmin-skins.min.css',

   <!-- SmartAdmin RTL Support is under construction-->
   'css/smartadmin-rtl.min.css',

   <!-- Goes with demo.js, you can delete this css when designing your own WebApp -->
   'css/demo.min.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

   // Load sails.io before everything else
   'js/dependencies/sails.io.js',

   'js/dependencies/jquery-2.0.2.min.js',
   'js/dependencies/jquery-ui-1.10.3.min.js',
   'js/dependencies/app.config.js',

   <!-- BOOTSTRAP JS -->
   'js/dependencies/bootstrap.min.js',

   <!-- AngularJS -->
   'js/dependencies/angular/angular.js',
   'js/dependencies/angular/angular-route.js',
   'js/dependencies/angular/angular-animate.js',
   'js/dependencies/angular/angular-ui-router.js',
   'js/dependencies/angular/angular-locale_pt-br.js',

   <!-- CUSTOM NOTIFICATION -->
   'js/notification/SmartNotification.min.js',

   'js/dependencies/userapp.io/userapp.client.js',
   'js/dependencies/userapp.io/angularjs.userapp.js',

   // Dependencies like jQuery, or Angular are brought in here

//   'js/dependencies/**/*.js',
   // All of the rest of your client-side js files
   // will be injected here in no particular order.

//   'js/**/*.js',

   <!-- JS TOUCH : include this plugin for mobile drag / drop touch events-->
   'js/plugin/jquery-touch/jquery.ui.touch-punch.min.js',

   <!-- JARVIS WIDGETS -->
   'js/smartwidgets/jarvis.widget.min.js',

   <!-- EASY PIE CHARTS -->
   'js/plugin/easy-pie-chart/jquery.easy-pie-chart.min.js',

   <!-- SPARKLINES -->
   'js/plugin/sparkline/jquery.sparkline.min.js',

   <!-- JQUERY VALIDATE -->
   'js/plugin/jquery-validate/jquery.validate.min.js',

   <!-- JQUERY MASKED INPUT -->
   'js/plugin/masked-input/jquery.maskedinput.min.js',

   <!-- JQUERY SELECT2 INPUT -->
   'js/plugin/select2/select2.min.js',

   <!-- JQUERY UI + Bootstrap Slider -->
   'js/plugin/bootstrap-slider/bootstrap-slider.min.js',

   <!-- browser msie issue fix -->
   'js/plugin/msie-fix/jquery.mb.browser.min.js',

   <!-- FastClick: For mobile devices: you can disable this in app.js -->
   'js/plugin/fastclick/fastclick.min.js',

   <!-- AngularJS -->
   'js/angular-file-upload/angular-file-upload.min.js',
   'js/dependencies/angular/ui-bootstrap-custom-tpls-0.11.0.js',

   <!-- Upload -->
   'js/es5-shim/es5-shim.min.js',
   'js/es5-shim/es5-sham.min.js',

   <!-- MAIN APP JS FILE -->
   'js/app.js',

   'js/controllers/dashboard.js',
   'js/controllers/fileupload.js',
   'js/controllers/lote.js',
   'js/controllers/selic.js',
   'js/controllers/apuracao.js',

   <!-- MAIN ANGULAR JS FILE -->
   'js/ng/ng.app.js',
   'js/ng/ng.controllers.js',
   'js/ng/ng.directives.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
   'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
   return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
   return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
   return 'assets/' + path;
});
