(function() {
   'use strict';

   function FileUploadCtrl($scope, $fileUploader) {
      'use strict';

      // create a uploader with options
      var uploader = $scope.uploader = $fileUploader.create({

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

                  return true;
               }
               console.log('File type is not valid')

               return false;
            }
         ]
      });


      // ADDING FILTERS

      uploader.filters.push(function (item) { // second user filter
         return true;
      });

      // REGISTER HANDLERS

      uploader.bind('afteraddingfile', function (event, item) {
         console.info('After adding a file', item);
      });

      uploader.bind('whenaddingfilefailed', function (event, item) {
         console.info('When adding a file failed', item);
      });

      uploader.bind('afteraddingall', function (event, items) {
         console.info('After adding all files', items);
      });

      uploader.bind('beforeupload', function (event, item) {
         console.info('Before upload', item);
      });

      uploader.bind('progress', function (event, item, progress) {
         console.info('Progress: ' + progress, item);
      });

      uploader.bind('success', function (event, xhr, item, response) {
         console.info('Success', xhr, item, response);
      });

      uploader.bind('cancel', function (event, xhr, item) {
         console.info('Cancel', xhr, item);
      });

      uploader.bind('error', function (event, xhr, item, response) {
         console.info('Error', xhr, item, response);
      });

      uploader.bind('complete', function (event, xhr, item, response) {
         console.info('Complete', xhr, item, response);
      });

      uploader.bind('progressall', function (event, progress) {
         console.info('Total progress: ' + progress);
      });

      uploader.bind('completeall', function (event, items) {
         console.info('Complete all', items);
      });

   }

   angular.module('apura.controllers.fileupload', ['angularFileUpload'])
      .controller('FileUploadCtrl', ['$scope', '$fileUploader', FileUploadCtrl]);

})();
