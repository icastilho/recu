/**
 * Created by icastilho on 01/08/14.
 */
Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');

function ApuracaoService() {

   this.apurar = function (loteName) {
      NotaFiscal.find()
         .where({lote: loteName})
         .sort('nfeProc.NFe.infNFe.ide.dEmi ASC')
         .exec(function (err, notas) {
            if (err) {
               return console.log(err);
            } else {
               if (notas.length > 0) {
                  run(notas, loteName);

               } else {
                  console.log("Nenhuma nota encontrada")
               }
            }
         });
   }

}

/**
 * Executa processo de apuracao
 * @param notas
 * @param lote
 */
function run(notas, lote) {
   var dataEmi = parseToDate(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
   var apuracao = createApuracao(notas[0].nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0], dataEmi, lote);
   var nfes = [];
   notas.forEach(function (nota) {

      var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
      if (cnpj != apuracao.cnpj) {
         console.error("CNPJ diferente encontrado no Lote", cnpj)
         //TODO implementar tratamento para CNPJ diferentes econtrados
      } else {
         var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
         var ano = dataEmissao.year();
         if (apuracao.ano == ano) {
            var trimestre = dataEmissao.quarter();
            if (apuracao.trimestre != trimestre) {
               apurarValores(apuracao, nfes);
               console.log("Novo trimestre:", trimestre)
               apuracao = createApuracao(apuracao.cnpj, dataEmissao, lote);
               nfes = [];
            }
         } else {
            apurarValores(apuracao, nfes);
            console.log("Novo ano :", ano)
            apuracao = createApuracao(apuracao.cnpj, dataEmissao, lote);
            nfes = [];
         }
         nfes.push(nota);
      }

   });

   Q.fcall(apurarValores, apuracao, nfes)
      .then(function (){
         LoteUpload.update({nome: lote}, {status: 'Processado'}).exec(function(err, lote){
            if(err) {
               console.high("Erro ao salvar lote", err);
            }
         });
      });
   console.log("Finish...")

}

/**
 * Soma os valores das notas
 * @param apuracao
 * @param nfes
 * @returns {*}
 */
function apurarValores(apuracao, nfes) {
   console.log("Apurando valores...")

   var deferred = Q.defer();
   var queue = [];

   nfes.forEach(function (nota) {
      var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
      var iCMS = BigNumber(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
      apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
      apuracao.frete = apuracao.frete.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]);
      apuracao.iCMS = apuracao.iCMS.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
      queue.push(Q.fcall(corrigirICMS, dataEmissao, iCMS));
      apuracao.qtdNotas++;
   });

   Q.all(queue).then(function (results) {
      results.forEach(function (result) {
         console.log(result.toString());
         apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(result)
      });

      saveApuracao(apuracao, function () {
         console.log("Saved!!!");
         console.log("qtdNotas", nfes.length);
         deferred.resolve();
      });
   });
   console.log("Finalizando apuracao...")
   return deferred.promise;
}

/**
 * Atualiza valor de ICMS com baseado na selic
 * @param dataEmissao
 * @param iCMS
 * @returns {*}
 */
function corrigirICMS(dataEmissao, iCMS) {
   var deferred = Q.defer();
   new SelicService().consultar(new Date(dataEmissao), iCMS, function (valor) {
      deferred.resolve(valor);
      console.log("iCMS: ", iCMS.toString(), " valor corrigido: ", valor.toString())
   });

   return   deferred.promise;
}

function saveApuracao(apuracao, callback) {


   apuracao.frete = apuracao.frete.toString();
   apuracao.valorTotal = apuracao.valorTotal.toString();
   apuracao.iCMSMultiplicado = apuracao.iCMSCorrigido.times(3.65).toString();
   apuracao.iCMS = apuracao.iCMS.toString();
   apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.toString();
   console.log("Saving apuracao...")
   console.log(apuracao);

   Apuracao
      .create(apuracao)
      .exec(function (err, apuracao) {
         console.log('create Apuracao done')
         // Error handling
         if (err) {
            return console.log(err);
            // The Apuracao was created successfully!
         } else {
            console.log("Apuracao created successfully:", apuracao);
         }
      });

   callback();

}

function createApuracao(cnpj, dataEmissao, lote) {
   console.log("Nova apuracao, ", dataEmissao.year(), dataEmissao.quarter())
   return apuracao = {
      cnpj: cnpj,
      ano: dataEmissao.year(),
      trimestre: dataEmissao.quarter(),
      lote: lote,
      qtdNotas: 0,
      iCMS: BigNumber(0),
      iCMSCorrigido: BigNumber(0),
      iCMSMultiplicado: BigNumber(0),
      frete: BigNumber(0),
      valorTotal: BigNumber(0)
   }

}

/**
 * Transforma o string 'yyyy-mm-dd' em data
 * @param sdate
 * @returns {Date}
 */
function parseToDate(sdate) {
   var date = moment(sdate, "YYYY-MM-DD");
   return date
}


module.exports = ApuracaoService;