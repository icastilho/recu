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
                console.log("[UPLOADJOB] Não foi possível ler o diretório de uploads ".underline.red);
                console.trace(err);

                return;
            }
          var uploadService = new UploadService();
          async.each(files, async.apply(uploadService.upload, dir), function(err){
            if( err ) {
              console.error('[UPLOADJOB] ERROR '.red);
              console.error(err.stack)
            } else {
              console.log('[UPLOADJOB] Todos os arquivos foram processados com SUCESSO'.green);
            }

          });

        });
    }
}

module.exports = UploadJob;
