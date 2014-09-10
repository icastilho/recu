(function () {
   'use strict';

   function LoteController($scope, $http) {

      $scope.lotes = [];
      $scope.regime = '';


      $scope.obterLotes = function () {
         $http.get('/loteupload')
            .success(function (data) {
               $scope.lotes = data;
            });
      }

      $scope.obterLotes();

      $scope.apurar = function (lote, regime) {
         lote.status = 'PROCESSANDO';
         $scope.regime = regime;

         $http.post('/apuracao/apurar', JSON.stringify({
            id: lote.id,
            regime: regime
         })).success(function (data) {
            lote.status = data.status;
         });
      };

      $scope.remover = function(lote) {
         $http.delete('/loteupload/'+lote.id)
            .success(function (data) {
               $scope.lotes.splice($scope.lotes.indexOf(lote), 1);
            });
      }

   }

   angular.module('apura.controllers.lote', [])
      .controller('LoteCtrl', ['$scope', '$http', LoteController]);

})();
