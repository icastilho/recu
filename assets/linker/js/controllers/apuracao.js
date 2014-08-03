/**
 * Created by icastilho on 02/08/14.
 */
(function() {
    'use strict';

    function ApuracaoController($scope, $http) {

        $scope.apuracoes = [];

        $http.get('/apuracao/list')
            .success(function(data) {
                $scope.apuracoes = data;
        });


    }

    angular.module('apura.controllers.apuracao', [])
        .controller('ApuracaoCtrl', ['$scope', '$http', ApuracaoController]);

})();

