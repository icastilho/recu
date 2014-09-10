Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');

function ApuracaoService() {

   const JUROS = 0.0033;

   this.apurar = function (lote, regime) {
      var deferred = Q.defer();

      console.log("Apuracao Runing...".green);

      updateStatus(lote, LoteUpload.LoteStatus.PROCESSANDO)
         .then(function() {
            return Apuracao.removerApuracoesDo(lote.nome);
         })
         .then(function() {
            return findNotasPor(lote.nome);
         })
         .then(function(notas) {
            return apurar(notas, lote.nome, regime)
         })
         .then(function() {
            return updateStatus(lote, LoteUpload.LoteStatus.PROCESSADO);
         })
         .done(function(lote) {
            console.log("done".green);
            deferred.resolve(lote);
         });

      return deferred.promise;
   }

   function findNotasPor(nome) {
      return NotaFiscal.find()
         .where({lote: nome})
         .sort('nfeProc.NFe.infNFe.ide.dEmi ASC');
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

   function extrairDataEmissao(nota) {
      return parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
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

         var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
         var dataEmissao = extrairDataEmissao(nota);
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
   function apurar(notas, lote, regime) {
      var deferred = Q.defer();
      var apuracoes = extrairApuracoesAFazer(notas);
      var apuracoesQueue = [];

      for(var cnpj in apuracoes) {

         for (var anomes in apuracoes[cnpj]) {
            var notas = apuracoes[cnpj][anomes];
            var pjNome = notas[0].nfeProc.NFe[0].infNFe[0].emit[0].xNome;
            var apuracao = criarApuracao(cnpj,pjNome, extrairDataEmissao(notas[0]), lote, regime);
            apuracao.qtdNotas = notas.length;

            apuracoesQueue.push(Q.fcall(apurarValores, apuracao, notas));
         }
      }

      Q.all(apuracoesQueue)
         .done(function() {
            deferred.resolve();
         });

      return deferred.promise;
   }

   /**
    * Soma os valores das notas
    * @param apuracao
    * @param nfes
    * @returns {*}
    */
   function apurarValores(apuracao, nfes) {
      console.log("Apurando valores...".green);

      var deferred = Q.defer();
      var correcoesICMSQueue = [];

      nfes.forEach(function (nota) {
         var dataEmissao = extrairDataEmissao(nota);
         var iCMS = BigNumber(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);

         apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
         apuracao.frete = apuracao.frete.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]);
         apuracao.iCMS = apuracao.iCMS.plus(iCMS);

         correcoesICMSQueue.push(
            Q.fcall(corrigirICMS, {dataEmissao: dataEmissao, iCMS:iCMS}));
      });

      Q.all(correcoesICMSQueue)
         .then(function (correcoesICMS) {
            correcoesICMS.forEach(function (correcao) {
               apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(correcao.iCMSCorrigido);
               apuracao.juros = apuracao.juros.plus(correcao.juros);
            });

            saveApuracao(apuracao, function () {
               console.log("Saved!!! month: ".green, apuracao.mes);
               console.log("qtdNotas".green, nfes.length);
               deferred.resolve();
            });
         });

      console.log("Finalizando apuracao...".green);
      return deferred.promise;
   }

   /**
    * Atualiza valor de ICMS com baseado na selic
    * @param nota
    * @returns {*}
    */
   function corrigirICMS(nota) {
      var deferred = Q.defer();

      var days =  moment().diff(nota.dataEmissao, 'days');

      SelicService.consultar(new Date(nota.dataEmissao), nota.iCMS, function (valor) {
         deferred.resolve({
            iCMSCorrigido: valor,
            juros: valor.times(JUROS).times(days)
         });
      });

      return deferred.promise;
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

      Apuracao
         .create(apuracao)
         .exec(function (err, apuracao) {
            if (err) {
               console.error(error);
               throw new (err);
            }

            callback();
         });
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
    * Cria novo Objeto Apuracao
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