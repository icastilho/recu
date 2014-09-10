/**
 * Created by icastilho on 02/08/14.
 */
(function() {
    'use strict';

    function ApuracaoController($scope, $http) {
        $scope.apuracao = '';
        $scope.apuracoes = [];

        $http.get('/apuracao')
            .success(function(data) {
                $scope.apuracoes = data;
        });

       $scope.remover = function(apuracao) {
          $http.delete('/apuracao/'+apuracao.id)
             .success(function (data) {
                $scope.apuracoes.splice($scope.apuracoes.indexOf(apuracao), 1);
             });
       }

    }

   function DetailController($scope, $http, $stateParams) {
      console.log($stateParams.id);

         $http.get('/apuracao/'+$stateParams.id)
         .success(function(data) {
               console.log(data)
            $scope.apuracao = data;
         });

   }

    angular.module('apura.controllers.apuracao', [])
        .controller('ApuracaoCtrl', ['$scope', '$http', ApuracaoController])
        .controller('ApuracaoDetailCtrl', ['$scope', '$http', '$stateParams', DetailController]);

})();

