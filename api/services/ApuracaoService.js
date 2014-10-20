Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');

function ApuracaoService() {

   const JUROS = 0.0033;

  this.apurar = function (lote) {
    var deferred = Q.defer();

    console.log("Apuracao Runing...".green);

    updateStatus(lote, LoteUpload.LoteStatus.PROCESSANDO)
      .then(function() {
        return Apuracao.removerApuracoesDo(lote.nome);
      })
      .then(function() {
        return corrigir(lote);
      })
      .then(function(notas) {
        return apurar(notas, lote.nome)
      })
      .then(function() {
        lote.status = LoteUpload.LoteStatus.PROCESSADO;
        deferred.resolve(lote);
      })
      .fail(function(err){
        console.error(err.stack);
        lote.status = LoteUpload.LoteStatus.ERRO;
        return deferred.reject(lote);
      })
      .done(function() {
        console.log("Done - status: ",lote.status);
        updateStatus(lote,lote.status);
      });
    return deferred.promise;
  }

    function corrigir(lote){
       var deferred = Q.defer();
       findNotasPor(lote.nome)
           .then(function(notas){
               console.log("total notas a atualizar: ",notas.length);
               var i = 0;

             async.each(notas, corrigirICMS, function(err){
                if( err ) {
                   console.error('A file failed to process');
                   console.error(err.stack);
                   deferred.reject();
                } else {
                   console.log('All files have been processed successfully');
                   deferred.resolve(notas);
                }
             });
           });
       return deferred.promise;
    }


   /**
    * Atualiza valor de ICMS com baseado na selic
    * @param nota
    * @returns {*}
    */
   function corrigirICMS(nota, callback) {

      nota.iCMS = BigNumber(nota.iCMS);
      var days =  moment().diff(nota.dataEmissao, 'days');

      SelicService.consultar(new Date(nota.dataEmissao), nota.iCMS, function (valor) {
          nota.iCMSCorrigido = valor.toString();
          nota.juros = valor.times(JUROS).times(days).toString();
          nota.iCMS = nota.iCMS.toString();
          nota.save();
          console.log('ICMS: ' + nota.iCMS + ' ICMS Corrigido: ' + nota.iCMSCorrigido);
          callback();
      });

   }

   function findNotasPor(nome) {
      return NotaFiscal.find()
         .where({lote: nome})
         .sort('dataEmissao ASC');
   }

   /**
    * Atualiza o status do lote
    * @param lote
    * @param status
    */
   function updateStatus(lote, status){
      lote.status = status.key;
      return lote.save();
   }


   /**
    * @param notas
    * @param apuracao
    * @param lote
    * @returns {Array} uma matriz com a estrutura [CNPJ][MES][NOTA]
    */
   function extrairApuracoesAFazer(notas) {
      var apuracoesAFazer = [];

      notas.forEach(function (nota) {

         var cnpj = nota.cnpj;
         var dataEmissao = parseToDate(nota.dataEmissao);
         var anomes =  Number(dataEmissao.year().toString()+dataEmissao.month().toString());

         if (!apuracoesAFazer[cnpj])
            apuracoesAFazer[cnpj] = [];

         if (nota.tipo == "VENDA") {

            if (!apuracoesAFazer[cnpj][anomes])
               apuracoesAFazer[cnpj][anomes] = [];

            apuracoesAFazer[cnpj][anomes].push(nota);

         } else {
            console.log("Nao é nota de venda: ".yellow, nota.chave);
         }

      });

      return apuracoesAFazer;
   }

   /**
    * Executa processo de apuracao
    * @param notas
    * @param lote
    */
   function apurar(notas, lote) {
      var deferred = Q.defer();
      var apuracoes = extrairApuracoesAFazer(notas);
      var apuracoesQueue = [];
      var regime = Apuracao.Regime.NAO_CUMULATIVO;
      for(var cnpj in apuracoes) {

         for (var anomes in apuracoes[cnpj]) {
            var notas = apuracoes[cnpj][anomes];
            var pjNome = notas[0].pjNome;
            var apuracao = criarApuracao(cnpj,pjNome, parseToDate(notas[0].dataEmissao), lote, regime);
            apuracao.qtdNotas = apuracoesQueue.length;

            apuracoesQueue.push(Q.fcall(apurarValores, apuracao, notas));
         }
      }

      Q.all(apuracoesQueue)
         .done(function() {
            deferred.resolve();
         });

      return deferred.promise;
   }

  function apurarCNPJ(cnpj, callback) {
    console.log('apurarCNPJ', cnpj);
    async.each(apuracoes[cnpj], async.apply(apurarNotas, apuracoes), function(err){
      if(err){
        callback(err);
      }
      callback();
      console.log('All Notas have been processed successfully');
    });
    callback();
  }

  function apurarNotas(apuracoes, anomes, callback) {
    console.log('apurarNotas');
    var notas = apuracoes[cnpj][anomes];
    var pjNome = notas[0].xNome;
    var apuracao = criarApuracao(cnpj,pjNome, parseToDate(notas[0].dataEmissao), lote, regime);
    apuracao.qtdNotas = notasapuracoesQueue.length;
    apurarValores(apuracao, notas, callback);
  }

   /**
    * Soma os valores das notas
    * @param apuracao
    * @param nfes
    * @returns {*}
    */
   function apurarValores(apuracao, nfes) {
      console.log("Apurando valores...".green);

      nfes.forEach(function (nota) {
         var iCMS = BigNumber(nota.iCMS);
         var iCMSCorrigido = BigNumber(nota.iCMSCorrigido);
         var juros =  BigNumber(nota.juros);

         apuracao.valorTotal = apuracao.valorTotal.plus(nota.valorNF);
         apuracao.frete = apuracao.frete.plus(nota.valorFrete);
         apuracao.iCMS = apuracao.iCMS.plus(iCMS);
         apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(iCMSCorrigido);
         apuracao.juros = apuracao.juros.plus(juros);

      });

      saveApuracao(apuracao, function (err) {
        if(err) {
          console.erro(err.stack);
        }else {
          console.log("Saved!!! month: ".green, apuracao.mes);
          console.log("qtdNotas".green, nfes.length);
        }
      });

      console.log("Finalizando apuracao...".green);
   }



   /**
    * Salva o resultado da Apuracao
    * @param apuracao
    * @param callback
    */
   function saveApuracao(apuracao, callback) {
      console.log('saveApuracao'.green);

      apuracao.frete = apuracao.frete.toString();
      apuracao.valorTotal = apuracao.valorTotal.toString();

      console.info(apuracao.regime);
      console.info(apuracao.regime.value.pis);
      console.info(apuracao.regime.value.cofins);

      console.info("BRUTO".yellow);
      apuracao.creditoBruto = calculaCredito(apuracao.iCMS, apuracao.regime)
      console.log(apuracao.creditoBruto);

      console.info("ATUALIZADO".yellow);
      apuracao.creditoAtualizado = calculaCredito(apuracao.iCMSCorrigido, apuracao.regime);
      console.info(apuracao.creditoAtualizado);

      console.info("VIRTUAL".yellow);
      apuracao.creditoVirtual = calculaCredito(apuracao.iCMSCorrigido.plus(apuracao.juros), apuracao.regime);
      console.info(apuracao.creditoVirtual);

      apuracao.iCMS = apuracao.iCMS.toString();
      apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.toString();

      Apuracao.create(apuracao)
         .exec(function (err, aa) {
            if (err){
              throw err;
            }
            else {
              console.log("Apuracao Salvo com SUCESSO...");
            }
        });

      callback();
   }

   /**
    * Calcula o valor a ser recuperado aplicando as alicotas de PIS/Confins de acordo com o tipo de Regime informado
    * @param valor
    * @param regime
    * @returns {{pis: *, cofins: *, total: *}}
    */
   function calculaCredito(valor, regime){
      var pis = regime.value.pis,
            cofins = regime.value.cofins,
               DARF = BigNumber(pis).plus(BigNumber(cofins));

      console.log("darf:", DARF);
      console.log('pis'+valor.times(pis).toString());
      console.log('cofins'+valor.times(cofins).toString());
      console.log('DARF'+valor.times(DARF).toString());

      var retorno = {
         pis: valor.times(pis).toString(),
         cofins: valor.times(cofins).toString(),
         total: valor.times(DARF).toString()
      };
      console.log(retorno);
      return retorno;
   }

   /**
    * Cria novo Objeto ApuracaocriarApuracao
    * @param cnpj
    * @param dataEmissao
    * @param lote
    * @returns {{cnpj: *, ano: *, trimestre: *, mes: *, lote: *, qtdNotas: number, iCMS: (*|exports), iCMSCorrigido: (*|exports), juros: (*|exports), creditoAtualizado: (*|exports), frete: (*|exports), valorTotal: (*|exports)}}
    */
   function criarApuracao(cnpj, nome, dataEmissao, lote, regime) {
      return {
         cnpj: cnpj,
         nome: nome,
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
         valorTotal: BigNumber(0),
         regime: regime
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

module.exports = new ApuracaoService();
