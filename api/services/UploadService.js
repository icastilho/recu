var fs = require('fs'),
    unzip = require('unzip'),
    xml2js = require('xml2js'),
    Q = require('q'),
    S = require('string'),
    path = require('path'),
    temp = require('temp');


var loteUpload;

function UploadService() {
    loteUpload = {
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
}

UploadService.prototype.processarArquivos = function () {
    var self = this;
    var dir = '.tmp/uploads';

    fs.readdir(dir, function (err, files) {
        if (err) throw err;

        files.forEach(function (file) {
            Q.fcall(self.upload, dir + '/' + file, file).
                then(function () {
                    fs.unlinkSync(dir + '/' + file);
                });
        });
    });
}

UploadService.prototype.upload = function (file, filename) {
    var deferred = Q.defer();

    console.log("arquivo " + filename + " inicio processamenot.");

    loteUpload.nome = filename;

    fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (arquivo) {

            if (invalidarArquivo(arquivo.path)) return;

            Q.fcall(parsearArquivo, arquivo)
                .then(validarXml)
                .then(classificar);

        })
        .on('close', function () {
            salvar(function () {
                deferred.resolve();
            });
        });

    return deferred.promise;
}

function parsearArquivo(arquivo) {
    var deferred = Q.defer();
    var parser = new xml2js.Parser({attrkey: '@'});

    temp.track();

    temp.mkdir('temp', function (err, dirPath) {
            var inputPath = path.join(dirPath, arquivo.path);

            arquivo
                .pipe(fs.createWriteStream(inputPath)
                    .on('close', function () {
                        fs.readFile(inputPath, function (error, data) {
                            parser.parseString(data, function (err, result) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
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
function invalidarArquivo(path) {
    return S(path).contains('MACOSX') || !(S(path).endsWith('.xml'))
}

function validarXml(notaJson) {
    if (notaJson != undefined && notaJson.nfeProc != undefined) {
        loteUpload.notas.push(notaJson);
        loteUpload.total++;

        return notaJson;
    } else {
        loteUpload.naoSaoNotas++;
    }

}

function classificar(notaJson) {
    var nota = JSON.stringify(notaJson);

    if (S(nota).contains('procCancNFe')) {
        loteUpload.totalCancelamento++;
    }

    var natOp = notaJson.nfeProc.NFe[0].infNFe[0].ide[0].natOp[0];

    if (S(natOp).contains('VENDA')) {
        loteUpload.totalCredito++;
    }

    if (S(nataOp).contains('REMESSA')) {
        loteUpload.totalRemessa++;
    }

}

function salvar(callback) {
    LoteUpload.create(loteUpload).exec(function (err, lote) {
        if (err)     console.log(err);
        else        callback(lote);
    });
}


module.exports = UploadService;
