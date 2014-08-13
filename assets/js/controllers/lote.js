(function() {
   'use strict';

   function LoteController($scope, $http, $timeout) {

      $scope.lotes = [];


      $scope.obterLotes = function (){
         $http.get('/loteupload')
            .success(function(data) {
               $scope.lotes = data;
            });
      }

      $scope.obterLotes();


      $scope.apurar = function(lote) {
         console.log('apurar lote:', lote.nome);

          $http.post('/apuracao/apurar', JSON.stringify({
              lote: lote.nome
          })).success(function(){
                lote.status = 'PROCESSANDO';
                $timeout($scope.obterLotes, 3000);
          });
      };

   }

   angular.module('apura.controllers.lote', [])
      .controller('LoteCtrl', ['$scope', '$http', '$timeout', LoteController]);

})();

