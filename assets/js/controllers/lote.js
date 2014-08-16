(function () {
   'use strict';

   function LoteController($scope, $http, $timeout) {

      $scope.lotes = [];


      $scope.obterLotes = function () {
         $http.get('/loteupload')
            .success(function (data) {
               $scope.lotes = data;
            });
      }

      $scope.obterLotes();

      $scope.apurar = function (lote) {
         lote.status = 'PROCESSANDO';

         $http.post('/apuracao/apurar', JSON.stringify({
            id: lote.id
         })).success(function (data) {
            lote.status = data.status;
         });
      };

   }

   angular.module('apura.controllers.lote', [])
      .controller('LoteCtrl', ['$scope', '$http', '$timeout', LoteController]);

})();
