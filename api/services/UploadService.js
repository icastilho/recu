var fs = require('fs'),
    xml2js = require('xml2js'),
    Q = require('q'),
    S = require('string'),
    path = require('path'),
    AdmZip = require('adm-zip');


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
        naoSaoNotas: 0
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

    console.log("arquivo " + filename + " inicio processamento.");

    loteUpload.nome = filename;

    var zip = new AdmZip(file);
    var dir = '.tmp/zips/';
    var queue = [];

    zip.extractAllTo(dir, true);

    var files = fs.readdirSync(dir);

    files.forEach(function (file) {
        if (invalidarArquivo(file)) return;
        queue.push(Q.fcall(parsearArquivo, dir + '/' + file));
    });

    Q.all(queue).then(function () {
        salvar(function(){
            deferred.resolve();
        })
    });

    return deferred.promise;
}

function parsearArquivo(path) {
    var deferred = Q.defer();
    var parser = new xml2js.Parser({attrkey: '@'});

    console.log("parseando arquivo: " + path);

    fs.readFile(path, function (error, data) {
        parser.parseString(data, function (err, nota) {
            if (err) {
                deferred.reject(err);
            } else {
                validarXml(nota);
                classificar(nota);
                deferred.resolve(nota);
            }
        });
    });

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

    if (S(natOp).contains('REMESSA')) {
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
