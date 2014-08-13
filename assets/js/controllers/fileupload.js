//Está usando esse plugin https://github.com/nervgh/angular-file-upload

(function() {
   'use strict';

   function FileUploadCtrl($scope, FileUploader) {
      'use strict';

      $scope.notificacoes = [];

       var uploader = $scope.uploader = new FileUploader({
           url: '/notafiscal/upload'
       });

      // FILTERS
       uploader.filters.push({
           name: 'customFilter',
           fn: function(item , options) {
               if(item.type=='application/zip'){
                   return true;
               }
               return false;
           }
       });

      uploader.onCompleteItem = function(fileItem, response, status, headers){
         $scope.notificacoes.push({item: fileItem.file.name});
      }

   }

   angular.module('apura.controllers.fileupload', ['angularFileUpload'])
      .controller('FileUploadCtrl', ['$scope', 'FileUploader', FileUploadCtrl]);

})();
