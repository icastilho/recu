/**
 * Created by icastilho on 01/08/14.
 */
(function() {
    'use strict';

    function SelicController($scope, $http) {

        $scope.selic = [];

        $scope.consultar = function(data, valor){
            data = new Date(2010,10,27)
            valor = 93.60
            $http.get('/selic/consultar?data='+data+"&valor="+valor);
        }

    }

    angular.module('apura.controllers.selic', [])
        .controller('SelicCtrl', ['$scope', '$http', SelicController]);

})();

