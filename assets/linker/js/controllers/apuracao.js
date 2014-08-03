/**
 * Created by icastilho on 02/08/14.
 */
(function() {
    'use strict';

    function ApuracaoController($scope, $http) {

        $scope.apuracao = [];

    }

    angular.module('apura.controllers.apuracao', [])
        .controller('ApuracaoCtrl', ['$scope', '$http', ApuracaoController]);

})();

