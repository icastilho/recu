(function() {
   'use strict';

   function FileUploadCtrl($scope, FileUploader) {
      'use strict';

       var uploader = $scope.uploader = new FileUploader({
           url: '/notafiscal/upload'
       });

    /*  // create a uploader with options
      var uploader = $scope.uploader = new FileUploader({

         scope: $scope,                          // to automatically update the html. Default: $rootScope
         url: '/notafiscal/upload',
         formData: [
            { key: 'value' }
         ],
         filters: [
            function (item) {                    // first user filter
               console.info('Filter Compressed file');
               if(item.type=='application/x-rar'
                  || item.type=='application/zip'
                  || item.type=='application/gzip'){
                  console.log('File type is valid');
                  console.log(item)
                  return true;
               }
               console.log('File type is not valid')

               return false;
            }
         ]
      });*/


      // FILTERS


       uploader.filters.push({
           name: 'customFilter',
           fn: function(item /*{File|FileLikeObject}*/, options) {
               return this.queue.length < 10;
           }
       });


       uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
           console.info('onWhenAddingFileFailed', item, filter, options);
       };
       uploader.onAfterAddingFile = function(fileItem) {
           console.info('onAfterAddingFile', fileItem);
       };
       uploader.onAfterAddingAll = function(addedFileItems) {
           console.info('onAfterAddingAll', addedFileItems);
       };
       uploader.onBeforeUploadItem = function(item) {
           console.info('onBeforeUploadItem', item);
       };
       uploader.onProgressItem = function(fileItem, progress) {
           console.info('onProgressItem', fileItem, progress);
       };
       uploader.onProgressAll = function(progress) {
           console.info('onProgressAll', progress);
       };
       uploader.onSuccessItem = function(fileItem, response, status, headers) {
           console.info('onSuccessItem', fileItem, response, status, headers);
       };
       uploader.onErrorItem = function(fileItem, response, status, headers) {
           console.info('onErrorItem', fileItem, response, status, headers);
       };
       uploader.onCancelItem = function(fileItem, response, status, headers) {
           console.info('onCancelItem', fileItem, response, status, headers);
       };
       uploader.onCompleteItem = function(fileItem, response, status, headers) {
           console.info('onCompleteItem', fileItem, response, status, headers);
       };
       uploader.onCompleteAll = function() {
           console.info('onCompleteAll');
       };

       console.info('uploader', uploader);

   }

   angular.module('apura.controllers.fileupload', ['angularFileUpload'])
      .controller('FileUploadCtrl', ['$scope', 'FileUploader', FileUploadCtrl]);

})();
