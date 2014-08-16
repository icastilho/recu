/**
 * Created by icastilho on 01/08/14.
 */
Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');
d = require('domain').create();

function ApuracaoService() {

   this.apurar = function (lote) {
      var deferred = Q.defer();

      d.on('error', function (err) {
         console.info("ERRROOOOOOOOOOOOOOOOOO")
         updateStatus(lote, LoteUpload.LoteStatus.ERRO);
         return deferred.reject("[Apuracao]Não foi possível apurar o lote: ", lote, "error: ", err.messagev);
      });

      d.run(function () {
         console.log("Apuracao Runing...")

         updateStatus(lote, LoteUpload.LoteStatus.PROCESSANDO);

         Apuracao.find()
            .where({lote: lote})
            .exec(function (err, apuracoes) {
               if (err) {
                  console.error(err);
                  deferred.reject(err);
               } else {
                  if (apuracoes) {
                     apuracoes.forEach(function (apuracao) {
                        apuracao.destroy(function (err) {
                           console.error("apuracao removed: ")
                           deferred.reject(err);
                        });
                     });

                  } else {
                     console.log("Nenhuma apuracao encontrada")
                  }

                  NotaFiscal.find()
                     .where({lote: lote})
                     .sort('nfeProc.NFe.infNFe.ide.dEmi ASC')
                     .exec(function (err, notas) {
                        if (err) {
                           console.error(err);
                           deferred.reject(err);
                        } else {
                           if (notas.length > 0) {
                              run(notas, lote,function () {
                                 deferred.resolve();
                              });
                           } else {
                              console.log("Nenhuma nota encontrada");
                              updateStatus(lote, LoteUpload.LoteStatus.PROCESSADO);
                           }
                        }
                     });
               }
            });
      });

      return deferred.promise;
   }


   /**
    * Atualiza o status do lote
    * @param lote
    * @param status
    */
   function updateStatus(lote, status){
      //console.debug("updateStatus", status.key);
      LoteUpload.update({nome: lote}, {status: status.key}).exec(function(err, lote){
         console.info("updated", lote);
         if(err) {
            console.high("Erro ao salvar lote", err);
         }
      });
   }

   /**
    * Executa processo de apuracao
    * @param notas
    * @param lote
    */
   function run(notas, lote, callback) {
      var dataEmi = parseToDate(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
      var apuracao = createApuracao(notas[0].nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0], dataEmi, lote);
      var nfes = [];
      notas.forEach(function (nota) {

         if(nota.tipo == "VENDA"){
            var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
            if (cnpj != apuracao.cnpj) {
               console.error("CNPJ diferente encontrado no Lote", cnpj);
               //TODO implementar tratamento para CNPJ diferentes econtrados
            } else {
               var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
               var mes = dataEmissao.format("MMMM");
               if (apuracao.mes != mes) {
                  apurarValores(apuracao, nfes);
                  apuracao = createApuracao(apuracao.cnpj, dataEmissao, lote);
                  nfes = [];
               }

               apuracao.qtdNotas++;
               nfes.push(nota);

            }
         }else{
            //console.info("Nao é nota de venda: ", nota.chave);
         }

      });

      Q.fcall(apurarValores, apuracao, nfes)
         .then(function (){
            updateStatus(lote, LoteUpload.LoteStatus.PROCESSADO);
            callback()
         });
      console.info("Finish...")

   }



   /**
    * Soma os valores das notas
    * @param apuracao
    * @param nfes
    * @returns {*}
    */
   function apurarValores(apuracao, nfes) {
      //console.debug("Apurando valores...");

      var deferred = Q.defer();
      var queue = [];

      nfes.forEach(function (nota) {
         var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
         var iCMS = BigNumber(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
         apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
         apuracao.frete = apuracao.frete.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]);
         apuracao.iCMS = apuracao.iCMS.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
         var n = {dataEmissao: dataEmissao,iCMS:iCMS };
         queue.push(Q.fcall(corrigirICMS, n));
      });

      Q.all(queue).then(function (results) {
         results.forEach(function (nota) {
            apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(nota.iCMSCorrigido);
            var juros = nota.juros.times(nota.qtdDias);
//            console.log("juros: ", nota.juros.toString(), " dias:", nota.qtdDias, " valor: ", juros.toString());

            apuracao.juros = apuracao.juros.plus(juros);
         });

         saveApuracao(apuracao, function () {
            //console.debug("Saved!!! month: ", apuracao.mes);
            //console.debug("qtdNotas", nfes.length);
            deferred.resolve();
         });
      });
      console.info("Finalizando apuracao...");
      return deferred.promise;
   }


   /**
    *   Variaveis globais de calculo
    */
   function staticJuros(){
      return 0.0033;
   }
   function staticDarf(){
      return  0.0925;
   }


   /**
    * Atualiza valor de ICMS com baseado na selic
    * @param dataEmissao
    * @param iCMS
    * @returns {*}
    */
   function corrigirICMS(nota) {
      var deferred = Q.defer();

      new SelicService().consultar(new Date(nota.dataEmissao), nota.iCMS, function (valor) {
         nota.iCMSCorrigido = valor;

         var today =  moment(new Date());
         nota.qtdDias = today.diff(nota.dataEmissao, 'days')
         nota.juros = nota.iCMSCorrigido.times(staticJuros())
//         console.log("iCMSCorrigido: ",  nota.iCMSCorrigido.toString(), " valor juros", nota.juros.toString())
         deferred.resolve(nota);
//         console.log("iCMS: ", iCMS.toString(), " valor corrigido: ", valor.toString())
      });

      return   deferred.promise;
   }

   /**
    * Aplica juros sobre o iCMS
    * Regra01
    * @param nota
    */
   function aplicarJuros(nota){
      var deferred = Q.defer();

      var start = moment(nota.dataEmissao);
      var today =  moment(new Date());
      nota.qtdDias = start.diff(today, 'days')
      nota.juros = nota.iCMSCorrigido.times(staticJuros())

      deferred.resolve(nota);
      return   deferred.promise;
   }

   /**
    * Salva o resultado da Apuracao
    * @param apuracao
    * @param callback
    */
   function saveApuracao(apuracao, callback) {
      apuracao.frete = apuracao.frete.toString();
      apuracao.valorTotal = apuracao.valorTotal.toString();
      apuracao.creditoBruto = apuracao.iCMS.times(staticDarf()).minus(0.01).toString();
      apuracao.creditoAtualizado = apuracao.iCMSCorrigido.times(staticDarf()).minus(0.01).toString();
      apuracao.creditoVirtual = apuracao.iCMSCorrigido.plus(apuracao.juros).times(staticDarf()).minus(0.01).toString();
      apuracao.iCMS = apuracao.iCMS.toString();
      apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.toString();
      console.info("Saving apuracao...")
      //console.debug(apuracao);

      Apuracao
         .create(apuracao)
         .exec(function (err, apuracao) {
            //console.debug('create Apuracao done')
            // Error handling
            if (err) {
               return console.error(err);
               // The Apuracao was created successfully!
            } else {
               console.info("Apuracao created successfully:", apuracao);
            }
         });

      callback();

   }

   /**
    * Cria novo Objeto Apuracao
    * @param cnpj
    * @param dataEmissao
    * @param lote
    * @returns {{cnpj: *, ano: *, trimestre: *, mes: *, lote: *, qtdNotas: number, iCMS: (*|exports), iCMSCorrigido: (*|exports), juros: (*|exports), creditoAtualizado: (*|exports), frete: (*|exports), valorTotal: (*|exports)}}
    */
   function createApuracao(cnpj, dataEmissao, lote) {
//      console.log("Nova apuracao, ", dataEmissao.year(), dataEmissao.quarter())
      return apuracao = {
         cnpj: cnpj,
         ano: dataEmissao.year(),
         trimestre: dataEmissao.quarter(),
         mes: dataEmissao.format("MMMM"),
         lote: lote,
         qtdNotas: 0,
         iCMS: BigNumber(0),
         iCMSCorrigido: BigNumber(0),
         juros: BigNumber(0),
         recuperar: BigNumber(0),
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

}

module.exports = ApuracaoService;