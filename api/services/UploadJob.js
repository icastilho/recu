var fs = require('fs'),
    Q = require('q'),
    UploadService = require('./UploadService');

function UploadJob(){
    this.processarArquivos = function () {
        var self = this;
        var dir = '.tmp/uploads';

        fs.readdir(dir, function (err, files) {
            if (err) throw err;

            files.forEach(function (file) {
                var uploadService = new UploadService();
                Q.fcall(uploadService.upload, dir + '/' + file, file).
                    then(function () {
                        fs.unlinkSync(dir + '/' + file);
                    });
            });
        });
    }
}

module.exports = UploadJob;
