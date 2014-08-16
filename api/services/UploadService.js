var fs = require('fs-extra'),
   xml2js = require('xml2js'),
   Q = require('q'),
   S = require('string'),
   path = require('path'),
   AdmZip = require('adm-zip'),
   d = require('domain').create();


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

   this.processarArquivos = function () {
      var self = this;
      var dir = '.tmp/uploads';

      fs.readdir(dir, function (err, files) {
         if (err) throw err;

         files.forEach(function (file) {
            Q.fcall(self.upload, dir + '/' + file, file).
               then(function () {
                  fs.unlinkSync(dir + '/' + file);
               }).fail(function (err) {
                  console.high(err);
               });
         });
      });
   }

   this.upload = function (file, filename) {
      var deferred = Q.defer();

      console.log("[Upload]arquivo " + filename + " inicio processamento.");
      loteUpload.nome = filename;

      var zip = new AdmZip(file);
      var dir = '.tmp/zips/';
      var queue = [];

      d.on('error', function (err) {
         return deferred.reject("[Upload]Não foi possível processar o arquivo zip: " + filename + "error: " + err.messagev);
      });

      d.run(function () {
         zip.extractAllTo(dir, true);
         var files = fs.readdirSync(dir);

         files.forEach(function (file) {
            if (invalidarArquivo(file)) return;
            queue.push(Q.fcall(parsearArquivo, dir + file));
         });

         Q.all(queue).then(function () {
            salvar(function () {
               deferred.resolve();
            })
         });
      });


      return deferred.promise;
   }


   function parsearArquivo(path) {
      var deferred = Q.defer();
      var parser = new xml2js.Parser({attrkey: '@'});

      console.log("[Upload]parseando arquivo: " + path);

      fs.readFile(path, function (error, data) {
         parser.parseString(data, function (err, nota) {
            if (err) {
               deferred.reject(err);
            } else {
               Q.fcall(validarXml, nota)
                  .then(classificar)
                  .then(function (nota) {
                     fs.unlinkSync(path);
                     deferred.resolve(nota);
                  });
            }
         });
      });

      return deferred.promise;
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
                  loteUpload.notas.push(notaJson);
                  loteUpload.total++;
               } else {
                  loteUpload.chavesDuplicadas.push(chNFe);
                  notaJson = "DUPLICADA";
                  loteUpload.duplicadas++;
               }

               deferred.resolve(notaJson);
            });

      } else {
         loteUpload.naoSaoNotas++;
         deferred.resolve("");
      }

      return deferred.promise;
   }

   function classificar(notaJson) {
      var nota = JSON.stringify(notaJson);

      if (S(nota).contains('procCancNFe')) {
         loteUpload.totalCancelamento++;

         notaJson.tipo = 'CANCELAMENTO';
      } else {
         if (S(nota).contains('nfeProc')) {
            var natOp = notaJson.nfeProc.NFe[0].infNFe[0].ide[0].natOp[0];

            if (S(natOp).contains('VENDA')) {
               loteUpload.totalCredito++;
               notaJson.tipo = 'VENDA';
            }

            if (S(natOp).contains('REMESSA')) {
               loteUpload.totalRemessa++;
               notaJson.tipo = 'REMESSA';
            }
         } else {
            loteUpload.outros++;
            notaJson.tipo = 'OUTROS';
         }
      }
   }

   function salvar(callback) {
      callback();

      console.log("Salvando LoteUpload...");

      var notas = loteUpload.notas.slice();
      loteUpload.notas = [];

      LoteUpload.create(loteUpload).exec(function (err, lote) {
         if (err)     console.log(err);
         else {

            notas.forEach(function(nota) {
               nota.lote = loteUpload.nome;
               nota.chave = nota.nfeProc.protNFe[0].infProt[0].chNFe[0];

               NotaFiscal.create(nota).exec(function (err, nota) {
                  if (err)     console.log(err)
               });
            });

            console.log("LoteUpload Salvo...");
         }
      });
   }
}


module.exports = UploadService;
