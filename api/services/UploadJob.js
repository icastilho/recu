var fs = require('fs'),
    Q = require('q'),
    colors = require('colors'),
    UploadService = require('./UploadService');

function UploadJob(){
    this.processarArquivos = function () {
        console.info("Processando Arquivos ... ".green);

        var self = this;
        var dir = '.tmp/uploads';

        fs.readdir(dir, function (err, files) {
            if (err) {
                console.log("[UPLOAD] Não foi possível ler o diretório de uploads ".underline.red);
                console.trace(err);

                return;
            }

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
