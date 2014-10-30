var fs = require('fs-extra'),
  xml2js = require('xml2js'),
  Q = require('q'),
  S = require('string'),
  path = require('path'),
  AdmZip = require('adm-zip'),
  d = require('domain').create(),
  walk = require('walk'),
  FileQueue = require('filequeue'),
  moment = require('moment'),
  fq = new FileQueue(200);



function UploadService() {
  var loteUpload = {
    nome: null,
    notas: [],
    arquivo: null,
    total: 0,
    totalCredito: 0,
    totalCancelamento: 0,
    totalRemessa: 0,
    naoSaoNotas: 0,
    chavesDuplicadas: [],
    duplicadas: 0,
    outros: 0,
    status: LoteUpload.LoteStatus.NOVO.key
  };


  this.upload = function (dir, filename) {
    var deferred = Q.defer();

    console.log("[Upload] arquivo " + filename + " inicio processamento.".green);
    loteUpload.nome = filename;
    var nomefile = dir+"/"+filename;
    console.log(nomefile);
    var zip = new AdmZip(nomefile);
    var dir = '.tmp/zips';

    d.on('error', function (err) {
      return deferred.reject("[Upload]Não foi possível processar o arquivo zip: " + filename + "error: " + err.messagev);
    });

    d.run(function () {
      zip.extractAllTo(dir, true);

      var walker = walk.walk(dir);

      walker.on("names", function (root, nodeNamesArray) {
        nodeNamesArray.sort(function (a, b) {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
      });

      walker.on("directories", function (root, dirStatsArray, next) {
        console.log('Is directory: ', dirStatsArray.name);
        next();
      });

      walker.on("file", function (root, fileStats, next) {
        if (invalidarArquivo(fileStats.name)){
          console.log("Is Invalid file",fileStatsdir+filename.name);
          next();
        }else {
          parsearArquivo(root + '/' + fileStats.name, next);
        }
      });

      walker.on("errors", function (root, nodeStatsArray, next) {
        console.log('[Error] file or directory '+ nodeStatsArray.name.red);
        next();
      });

      walker.on("end", function () {
        salvar(function () {
          fs.unlinkSync(nomefile);
          console.log("[Upload]arquivo ".green + filename + " processado com SUCESSO.".green);
          deferred.resolve();
          walker = null;
        });
      });

    });

    return deferred.promise;
  };


  function parsearArquivo(path, callback) {
    var parser = new xml2js.Parser({attrkey: '@'});

    console.log("[Upload]parseando arquivo: " + path);

    fq.readFile(path, function (err, data) {
      if (err)     console.log(err);

      parser.parseString(data, function (err, notaJson) {
        if (err) {
          deferred.reject(err);
        } else {
          validarXml(notaJson)
            .then(classificar)
            .then(salvarNota)
            .fail(function(err){
              console.error(err.stack);
              callback(err);
            })
            .done(function () {
              fs.unlink(path, function (err) {
                if (err) { console.error(err.stack); callback(err);}
                else{  console.log('successfully deleted ', path); callback();}
                data = null;
                notaJson = null;
              });
            });
        }
      });
    });

  }

  function invalidarArquivo(path) {
    return S(path).contains('MACOSX') || !(S(path).endsWith('.xml'))
  }

  function validarXml(notaJson) {
    var deferred = Q.defer();

    if (notaJson != undefined && notaJson.nfeProc != undefined) {
      var chNFe = notaJson.nfeProc.protNFe[0].infProt[0].chNFe[0];

      NotaFiscal.find()
        .where({chave: chNFe})
        .exec(function (err, nota) {
          if (nota.length == 0) {
            loteUpload.total++;
          } else {
            loteUpload.chavesDuplicadas.push(chNFe);
            notaJson = undefined;
            loteUpload.duplicadas++;
          }

          deferred.resolve(notaJson);
        });

    } else {
      loteUpload.naoSaoNotas++;
      deferred.resolve();
    }

    return deferred.promise;
  }

  function classificar(notaJson) {
    var deferred = Q.defer();
    if(notaJson) {

      var nota = parseNota(notaJson);
      notaJson = salvarNotaJson(notaJson);

      if (S(notaJson).contains('procCancNFe')) {
        loteUpload.totalCancelamento++;

        nota.tipo = 'CANCELAMENTO';
      } else {
        if (S(notaJson).contains('nfeProc')) {

          if (S(nota.natOp).contains('VENDA')) {
            loteUpload.totalCredito++;
            nota.tipo = 'VENDA';
          }

          if (S(nota.natOp).contains('REMESSA')) {
            loteUpload.totalRemessa++;
            nota.tipo = 'REMESSA';
          }
        } else {
          loteUpload.outros++;
          nota.tipo = 'OUTROS';
        }
      }
      deferred.resolve(nota);
    }else{
      deferred.resolve();
    }

    return deferred.promise;
  }

  function salvarNotaJson(notaJson) {
      notaJson.lote = loteUpload.nome;
      NotaFiscalJson.create(notaJson, function(err){
        if(err) console.log(err.stack);
      });
      return JSON.stringify(notaJson);
  }

  function salvarNota(nota) {
    if (nota){
      return NotaFiscal.create(nota);
    }
  }


  function parseNota(notaJson){
    return {
      lote: loteUpload.nome,
      chave: notaJson.nfeProc.protNFe[0].infProt[0].chNFe[0],
      natOp: notaJson.nfeProc.NFe[0].infNFe[0].ide[0].natOp[0],
      cnpj: notaJson.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0],
      pjNome: notaJson.nfeProc.NFe[0].infNFe[0].emit[0].xNome[0],
      iCMS: notaJson.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0],
      dataEmissao: notaJson.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0],
      pPIS: parseFloat(notaJson.nfeProc.NFe[0].infNFe[0].det[0].imposto[0].PIS[0].PISAliq[0].pPIS[0]),
      pCOFINS: parseFloat(notaJson.nfeProc.NFe[0].infNFe[0].det[0].imposto[0].COFINS[0].COFINSAliq[0].pCOFINS[0]),
      valorNF: notaJson.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0],
      valorFrete: notaJson.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]
    }
  }

  function salvar(callback) {
    callback();

    console.log("[LoteUpload] Salvando ...".green);

    loteUpload.notas = [];

    LoteUpload.create(loteUpload).exec(function (err, lote) {
      if (err)  throw err;
      else {
        console.log("[LoteUpload] Salvo com SUCESSO".green);
      }
    });
  }

}


module.exports = UploadService;
