var fs = require('fs');
var unzip = require('unzip');
var xml2js = require('xml2js');
var Q = require('q');
var S = require('string');



var loteUpload;

function UploadService(){}

UploadService.prototype.upload = function(upload, callback){
    fs.createReadStream(upload.path)
        .pipe(unzip.Parse())
        .on('entry', function (arquivo) {
            if(S(arquivo.path).contains('MACOSX')) return;

            Q.fcall(parsearArquivo, arquivo)
             .then(validar);
        })
        .on('close', callback);
}
function parsearArquivo(arquivo){
    var deferred = Q.defer();
    var parser = new xml2js.Parser();

    arquivo.pipe(fs.createWriteStream(arquivo.path).on('close', function(){
        fs.readFile(arquivo.path, function (error, data) {

            parser.parseString(data, function (err, result) {
                if (error) {
                    deferred.reject(new Error(error));
                } else{
                    deferred.resolve(result);
                }
            });
        });
    }));

    return deferred.promise;
}

function validar(notaJson) {
    console.log(notaJson);
}

module.exports = UploadService;