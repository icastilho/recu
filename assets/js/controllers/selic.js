/**
 * Created by icastilho on 01/08/14.
 */
(function() {
    'use strict';

    function SelicController($scope, $http) {

        $scope.selic = [];
        $scope.carregando = false;
        $scope.data = '12/12/2012';
        $scope.valor = '0';
        $scope.selic = null;

        $scope.consultar = function(data, valor){
            $scope.carregando = true;
            $http.get('/selic/consultar?data='+$scope.data+"&valor="+$scope.valor).success(function(result){
                $scope.carregando = false;
                $scope.selic = result;
            });
        }

    }

    angular.module('apura.controllers.selic', [])
        .controller('SelicCtrl', ['$scope', '$http', SelicController]);

})();

