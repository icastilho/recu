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
   <!-- Basic Styles -->
   'linker/css/bootstrap.min.css',
   'linker/css/font-awesome.min.css',

   <!-- SmartAdmin Styles : Please note (smartadmin-production.css) was created using LESS variables -->
   'linker/css/smartadmin-production.min.css',
   'linker/css/smartadmin-skins.min.css',

   <!-- SmartAdmin RTL Support is under construction-->
   'linker/css/smartadmin-rtl.min.css',

   <!-- Goes with demo.js, you can delete this css when designing your own WebApp -->
   'linker/css/demo.min.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

   'linker/js/libs/jquery-2.0.2.min.js',
   'linker/js/libs/jquery-ui-1.10.3.min.js',
   'linker/js/app.config.js',

   <!-- JS TOUCH : include this plugin for mobile drag / drop touch events-->
   'linker/js/plugin/jquery-touch/jquery.ui.touch-punch.min.js',

   <!-- BOOTSTRAP JS -->
   'linker/js/bootstrap/bootstrap.min.js',

   <!-- CUSTOM NOTIFICATION -->
   'linker/js/notification/SmartNotification.min.js',

   <!-- JARVIS WIDGETS -->
   'linker/js/smartwidgets/jarvis.widget.min.js',

   <!-- EASY PIE CHARTS -->
   'linker/js/plugin/easy-pie-chart/jquery.easy-pie-chart.min.js',

   <!-- SPARKLINES -->
   'linker/js/plugin/sparkline/jquery.sparkline.min.js',

   <!-- JQUERY VALIDATE -->
   'linker/js/plugin/jquery-validate/jquery.validate.min.js',

   <!-- JQUERY MASKED INPUT -->
   'linker/js/plugin/masked-input/jquery.maskedinput.min.js',

   <!-- JQUERY SELECT2 INPUT -->
   'linker/js/plugin/select2/select2.min.js',

   <!-- JQUERY UI + Bootstrap Slider -->
   'linker/js/plugin/bootstrap-slider/bootstrap-slider.min.js',

   <!-- browser msie issue fix -->
   'linker/js/plugin/msie-fix/jquery.mb.browser.min.js',

   <!-- FastClick: For mobile devices: you can disable this in app.js -->
   'linker/js/plugin/fastclick/fastclick.min.js',

   <!-- AngularJS -->
   'linker/js/libs/angular/angular.js',
   'linker/js/libs/angular/angular-route.js',
   'linker/js/libs/angular/angular-animate.js',
   'linker/js/libs/angular/angular-ui-router.js',
   'linker/js/angular-file-upload/angular-file-upload.min.js',
   'linker/js/libs/angular/ui-bootstrap-custom-tpls-0.11.0.js',

    <!-- Upload -->
    'linker/js/es5-shim/es5-shim.min.js',
    'linker/js/es5-shim/es5-sham.min.js',

   <!-- Userapp.io -->
   'linker/js/libs/userapp.io/userapp.client.js',
   'linker/js/libs/userapp.io/angularjs.userapp.js',

   <!-- MAIN APP JS FILE -->
   'linker/js/app.js',

   'linker/js/controllers/fileupload.js',
   'linker/js/controllers/lote.js',
   'linker/js/controllers/selic.js',

   <!-- MAIN ANGULAR JS FILE -->
   'linker/js/ng/ng.app.js',
   'linker/js/ng/ng.controllers.js',
   'linker/js/ng/ng.directives.js',

   // Bring in the socket.io client
   'linker/js/socket.io.js',

   // then beef it up with some convenience logic for talking to Sails.js
   'linker/js/sails.io.js'
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
