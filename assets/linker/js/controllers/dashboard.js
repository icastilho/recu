/**
 * Created by icastilho on 02/08/14.
 */
(function() {
    'use strict';

    function DashBoardController($scope, $http) {
        $scope.dash = [];
    }

    angular.module('apura.controllers.dashboard', [])
        .controller('DashBoardCtrl', ['$scope', '$http', DashBoardController]);

})();
