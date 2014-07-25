var fs = require('fs'),
    unzip = require('unzip'),
    xml2js = require('xml2js'),
    Q = require('q'),
    S = require('string'),
    path = require('path'),
    temp = require('temp');



var loteUpload = {
    nome: null,
    notas: [],
    arquivo: null,
    total: 0,
    totalCredito: 0,
    totalCancelamento: 0,
    totalRemessa: 0,
    naoSaoNotas: 0,
    dataUpload: new Date()
};

function UploadService(){

}

UploadService.prototype.upload = function(upload){
    var deferred = Q.defer();

    loteUpload.nome = upload.path;

    fs.createReadStream(upload.path)
        .pipe(unzip.Parse())
        .on('entry', function (arquivo) {
            if(invalidarArquivo(arquivo.path)) return;

            Q.fcall(parsearArquivo, arquivo)
                .then(validarXml)
                .then(classificar);

        })
        .on('close', function(){
            salvar(function(){
                deferred.resolve;
            });

        });

    return deferred.promise;
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
                            if (err) {
                                deferred.reject(err);
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

function validarXml(notaJson) {
    if(notaJson != undefined && S(notaJson).contains('NFe')){
        loteUpload.notas.push(notaJson);
        loteUpload.total++;

        return notaJson;
    } else{
        loteUpload.naoSaoNotas++;
    }

}

function classificar(notaJson) {
    if(notaJson != undefined){

    }
}

function salvar(callback) {
    LoteUpload.create(loteUpload).done(function(err, lote){
        if(err)     console.log(err);
        else        callback(lote);
    });
}



module.exports = UploadService;
