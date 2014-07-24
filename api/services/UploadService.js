var fs = require('fs'),
    unzip = require('unzip'),
    xml2js = require('xml2js'),
    Q = require('q'),
    S = require('string'),
    path = require('path'),
    temp = require('temp');



var loteUpload;

function UploadService(){

}

UploadService.prototype.upload = function(upload, callback){
    console.log(upload);
    fs.createReadStream(upload.path)
        .pipe(unzip.Parse())
        .on('entry', function (arquivo) {
            if(invalidarArquivo(arquivo.path)) return;

            Q.fcall(parsearArquivo, arquivo)
             .then(validar);
        })
        .on('close', callback);
}

function parsearArquivo(arquivo){
    var deferred = Q.defer();
    var parser = new xml2js.Parser();

    temp.track();

    temp.mkdir('temp', function(err, dirPath) {
        var inputPath = path.join(dirPath, arquivo.path);

        arquivo
            .pipe(fs.createWriteStream(inputPath)
                .on('close', function(){
                    fs.readFile(inputPath, function (error, data) {

                        parser.parseString(data, function (err, result) {
                            if (error) {
                                deferred.reject(new Error(error));
                            } else{
                                deferred.resolve(result);
                            }
                        });
                    });
                })
            );
        }
    );

    return deferred.promise;
}

function invalidarArquivo(path){    
    return S(path).contains('MACOSX') || !(S(path).endsWith('.xml'))
}

function validar(err, notaJson) {    
    if(err){
        console.log("error :"+err);
    } else {
        console.log(notaJson);
    }    
}

module.exports = UploadService;