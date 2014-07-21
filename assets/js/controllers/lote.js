/**
 * Created by icastilho on 20/07/14.
 */
angular.module('apura.controllers.lote', [])
    .controller('LoteCtrl', function ($scope, $http, $fileUploader) {

    var lotes = $scope.lotes = [];

    $http.get('/file/view')
        .success(function(data) {
            console.log(data.lotes);
            $scope.lotes = data.lotes;
    })


    $scope.processar = function(lote){
        console.log('Porcessar')
    }

});