angular.module('app.controllers', [])
  .factory('settings', ['$rootScope', function($rootScope){

    var settings = {
      languages: [
        {
          language: 'Portuguese',
          translation: 'português',
          langCode: 'pt',
          flagCode: 'br'
        }
      ]
    };

    return settings;

  }])

  .controller('SmartAppController', ['$scope', function($scope) {
    // your main controller
  }])

  .controller('LangController', ['$scope', 'settings', 'localize', function($scope, settings, localize) {
    $scope.languages = settings.languages;
    $scope.currentLang = settings.currentLang;
    $scope.setLang = function(lang) {
      settings.currentLang = lang;
      $scope.currentLang = lang;
      localize.setLang(lang);
    }

    // set the default language
    $scope.setLang($scope.currentLang);

  }]);
