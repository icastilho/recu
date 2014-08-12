/**
 * Created by icastilho on 01/08/14.
 */
Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');
d = require('domain').create();

function ApuracaoService() {

   // Calma, ainda vou arrumar isso aqui
   this.apurar = function (loteName) {
      var deferred = Q.defer();

      d.on('error', function (err) {
         LoteUpload.update({nome: req.param("lote")}, {status: 'Processado'}).exec(function(err, lote){
            if(err) {
               console.log("Error".underline.red, err)
            }
         });
         return deferred.reject("[Apuracao]Não foi possível apurar o lote: " + loteName + "error: " + err.messagev);
      });

      d.run(function () {

         LoteUpload.update({nome:loteName}, {status: 'Processando'}).exec(function(err, lote){
            if(err) {
               console.log("Error".underline.red, err)
               deferred.reject(err);
            }
         });

         Apuracao.find()
            .where({lote: loteName})
            .exec(function (err, apuracoes) {
               if (err) {
                  console.log(err);
                  deferred.reject(err);
               } else {
                  if (apuracoes) {

                     apuracoes.forEach(function (apuracao) {
                        apuracao.destroy(function (err) {
                           console.log("apuracao removed: ")
                           deferred.reject(err);
                        });
                     });

                  } else {
                     console.log("Nenhuma apuracao encontrada")
                  }

                  NotaFiscal.find()
                     .where({lote: loteName})
                     .sort('nfeProc.NFe.infNFe.ide.dEmi ASC')
                     .exec(function (err, notas) {
                        if (err) {
                           console.log(err);
                           deferred.reject(err);
                        } else {
                           if (notas.length > 0) {
                              run(notas, loteName,function () {
                                 deferred.resolve();
                              });
                           } else {
                              console.log("Nenhuma nota encontrada");
                              LoteUpload.update({nome: loteName}, {status: 'Processado'}).exec(function(err, lote){
                                 if(err) {
                                    console.high("Erro ao salvar lote", err);
                                 }
                              });
                           }
                        }
                     });
               }
            });
      });

      return deferred.promise;
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
            console.log("Nao é nota de venda: ", nota.chave);
         }

      });

      Q.fcall(apurarValores, apuracao, nfes)
         .then(function (){
            LoteUpload.update({nome: lote}, {status: 'Processado'}).exec(function(err, lote){
               if(err) {
                  console.high("Erro ao salvar lote", err);
               }
               callback()
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
      console.log("Apurando valores...");

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
            console.log("juros: ", nota.juros.toString(), " dias:", nota.qtdDias, " valor: ", juros.toString());

            apuracao.juros = apuracao.juros.plus(juros);
         });

         saveApuracao(apuracao, function () {
            console.log("Saved!!! month: ", apuracao.mes);
            console.log("qtdNotas", nfes.length);
            deferred.resolve();
         });
      });
      console.log("Finalizando apuracao...");
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

   function saveApuracao(apuracao, callback) {
      apuracao.frete = apuracao.frete.toString();
      apuracao.valorTotal = apuracao.valorTotal.toString();
      apuracao.recuperar = apuracao.iCMSCorrigido.times(staticDarf()).minus(0.01).toString();
      apuracao.recuperarComJuros = apuracao.iCMSCorrigido.plus(apuracao.juros).times(staticDarf()).minus(0.01).toString();
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