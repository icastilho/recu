(function() {
   'use strict';

   function LoteController($scope, $http) {

      $scope.lotes = [];

      $http.get('/loteupload/view')
         .success(function(data) {
            $scope.lotes = data.lotes;
         });


      $scope.processar = function(loteName) {
         $http.post('/notafiscal/process', loteName);
      };

   }

   angular.module('apura.controllers.lote', [])
      .controller('LoteCtrl', ['$scope', '$http', LoteController]);

})();

