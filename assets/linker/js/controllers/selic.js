/**
 * Created by icastilho on 01/08/14.
 */
(function() {
    'use strict';

    function SelicController($scope, $http) {

        $scope.selic = [];
        $scope.data = '12/12/2012';
        $scope.valor = '0';
        $scope.selic = null;

        $scope.consultar = function(data, valor){
            $http.get('/selic/consultar?data='+$scope.data+"&valor="+$scope.valor).success(function(result){
                $scope.selic = result;
            });
        }

    }

    angular.module('apura.controllers.selic', [])
        .controller('SelicCtrl', ['$scope', '$http', SelicController]);

})();

