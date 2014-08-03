(function() {
   'use strict';

   function LoteController($scope, $http) {

      $scope.lotes = [];

      $http.get('/loteupload/view')
         .success(function(data) {
            $scope.lotes = data.lotes;
         });


      $scope.apurar = function(loteName) {
          console.log('apurar lote:',loteName)

          $http.post('/apuracao/apurar', JSON.stringify({
              lote: loteName
          }));
      };

   }

   angular.module('apura.controllers.lote', [])
      .controller('LoteCtrl', ['$scope', '$http', LoteController]);

})();

