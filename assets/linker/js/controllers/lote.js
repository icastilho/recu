/**
 * Created by icastilho on 20/07/14.
 */
angular.module('apura.controllers.lote', [])
    .controller('LoteCtrl', function ($scope, $http, $fileUploader) {

    var lotes = $scope.lotes = [];

    $http.get('/loteupload/view')
        .success(function(data) {
            console.log(data.lotes);
            $scope.lotes = data.lotes;
    })


    $scope.processar = function(loteName){
        $http.post('/notafiscal/process',loteName);
        console.log('Porcessar')
    }

});