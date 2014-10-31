Q = require('q');
var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');

function ApuracaoService() {

  const JUROS = 0.0033;

  this.apurar = function (lote) {
    var deferred = Q.defer();

    console.log("[Apuracao] Runing...".green);

    updateStatus(lote, LoteUpload.LoteStatus.PROCESSANDO)
      .then(function() {
        return Apuracao.removerApuracoesDo(lote.nome);
      })
      .then(function() {
        return corrigir(lote);
      })
      .then(function(notas) {
        return apurar(notas)
      })
      .then(function() {
        lote.status = LoteUpload.LoteStatus.PROCESSADO.key;
        deferred.resolve(lote);
      })
      .fail(function(err){
        console.error(err.stack);
        lote.status = LoteUpload.LoteStatus.ERRO.key;
        return deferred.reject(lote);
      })
      .done(function() {
        console.log("[Apuracao] Concluido! Status: ".green,lote.status);
        deferred.resolve(lote);
        updateStatus(lote);
      });
    return deferred.promise;
  }

  function corrigir(lote){
    var deferred = Q.defer();
    findNotasPor(lote.nome)
      .then(function(notas){
        var def = Q.defer();
        console.log("[Apuracao] Total notas a atualizar: ",notas.length);
        var i = 0;

        async.each(notas, corrigirICMS, function(err){
          if( err ) {
            console.error('[ ICMS ] ERROR'.red);
            console.error(err.stack);
            deferred.reject();
          } else {
            console.log('[ ICMS ] Atualizado com SUCESSO'.green);
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
    SelicService.consultar(new Date(parseToDate(nota.dataEmissao)), nota.iCMS, function (valor) {
      nota.juros = valor.times(JUROS).times(days);

      //console.info("[Apuracao] BRUTO".blue);
      nota.creditoBruto = calculaCredito(nota.iCMS, nota.pPIS, nota.pCOFINS);
      //console.log(nota.creditoBruto);

      //console.info("[Apuracao] ATUALIZADO".blue);
      nota.creditoAtualizado = calculaCredito(valor, nota.pPIS, nota.pCOFINS);
      //console.info(nota.creditoAtualizado);

      //console.info("[Apuracao] VIRTUAL".blue);
      nota.creditoVirtual = calculaCredito(valor.plus(nota.juros), nota.pPIS, nota.pCOFINS);
      //console.info(nota.creditoVirtual);

      nota.iCMSCorrigido = valor.toString();
      nota.iCMS = nota.iCMS.toString();
      nota.juros = nota.juros.toString();

      nota.save(function atualizandoICMS(err,notaSaved){
        console.log('[ ICMS ] iCMS: ', notaSaved.iCMS ,' ICMS Corrigido: ',notaSaved.iCMSCorrigido, " - Data: ", nota.dataEmissao);
        callback();
      });
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
  function updateStatus(lote){
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
      var key = cnpj+anomes;

      if (nota.tipo == "VENDA") {
        if (!apuracoesAFazer[key])
          apuracoesAFazer[key] = [];
        apuracoesAFazer[key].push(nota);
      } else {
        console.log("[Apuracao] Nao é nota de venda: ".yellow, nota.chave);
        nota = null;
      }
    });

    return apuracoesAFazer;
  }

  /**
   * Executa processo de apuracao
   * @param notas
   * @param lote
   */
  function apurar(notas) {
    var deferred = Q.defer();
    var apuracoes = extrairApuracoesAFazer(notas);

    async.each(Object.keys(apuracoes), async.apply(apurarCNPJ, apuracoes), function(err){
      if( err ) {
        console.error('[Apurando] ERROR '.red);
      } else {
        console.log('[Apurando] Todas as apuracoes foram processadas com SUCESSO'.green);
        deferred.resolve();
      }
      apuracoes = null;
    });

    return deferred.promise;
  }

  function apurarCNPJ(apuracoes, cnpj, callback) {
    var notas = apuracoes[cnpj];

    var pjNome = notas[0].pjNome;
    var apuracao = criarApuracao(notas[0].cnpj,pjNome, parseToDate(notas[0].dataEmissao), notas[0].lote);
    apuracao.qtdNotas = notas.length;
    apurarValores(apuracao, notas, callback);
  }

  /**
   * Soma os valores das notas
   * @param apuracao
   * @param nfes
   * @returns {*}
   */
  function apurarValores(apuracao, nfes, callback) {

    nfes.forEach(function (nota) {
      var iCMS = BigNumber(nota.iCMS);
      var iCMSCorrigido = BigNumber(nota.iCMSCorrigido);
      var juros =  BigNumber(nota.juros);


      apuracao.valorTotal = apuracao.valorTotal.plus(nota.valorNF);
      apuracao.frete = apuracao.frete.plus(nota.valorFrete);
      apuracao.iCMS = apuracao.iCMS.plus(iCMS);
      apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(iCMSCorrigido);
      apuracao.juros = apuracao.juros.plus(juros);

      apuracao.creditoBruto.pis = BigNumber(nota.creditoBruto.pis||0);
      apuracao.creditoBruto.cofins = BigNumber(nota.creditoBruto.cofins||0);
      apuracao.creditoBruto.total= BigNumber(nota.creditoBruto.total||0);

      apuracao.creditoAtualizado.pis = BigNumber(nota.creditoAtualizado.pis||0);
      apuracao.creditoAtualizado.cofins = BigNumber(nota.creditoAtualizado.cofins||0);
      apuracao.creditoAtualizado.total= BigNumber(nota.creditoAtualizado.total||0);

      apuracao.creditoVirtual.pis = BigNumber(nota.creditoVirtual.pis||0);
      apuracao.creditoVirtual.cofins = BigNumber(nota.creditoVirtual.cofins||0);
      apuracao.creditoVirtual.total= BigNumber(nota.creditoVirtual.total||0);

    });

    saveApuracao(apuracao, function (err) {
      if(err) {
        console.error(err.stack);
      }else {
        console.log("[Apurando] Saved!!! mes: ".green, apuracao.mes);
        console.log("[Apurando] qtdNotas".green, nfes.length);
      }
      nfes = null;
      callback();
    });

    console.log("[Apurando] Finalizando apuracao...".green);
  }



  /**
   * Salva o resultado da Apuracao
   * @param apuracao
   * @param callback
   */
  function saveApuracao(apuracao, callback) {
    console.info('[Apuracao] saveApuracao'.blue);

    apuracao.frete = apuracao.frete.toString();
    apuracao.valorTotal = apuracao.valorTotal.toString();

    apuracao.creditoBruto.pis = apuracao.creditoBruto.pis.toString();
    apuracao.creditoBruto.cofins = apuracao.creditoBruto.cofins.toString();
    apuracao.creditoBruto.total = apuracao.creditoBruto.cofins.toString();

    apuracao.creditoAtualizado.pis = apuracao.creditoAtualizado.pis.toString();
    apuracao.creditoAtualizado.cofins = apuracao.creditoAtualizado.cofins.toString();
    apuracao.creditoAtualizado.total= apuracao.creditoAtualizado.total.toString();

    apuracao.creditoVirtual.pis = apuracao.creditoVirtual.pis.toString();
    apuracao.creditoVirtual.cofins = apuracao.creditoVirtual.cofins.toString();
    apuracao.creditoVirtual.total= apuracao.creditoVirtual.total.toString();

    apuracao.iCMS = apuracao.iCMS.toString();
    apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.toString();
    apuracao.juros = apuracao.juros.toString();
    apuracao.recuperar = apuracao.recuperar.toString();

    Apuracao.create(apuracao).exec(function (err, ap) {
      if (err){
        console.log("[Apuracao] Salvo com ERROR".red);
        throw err;
      }
      else {
        console.log("[Apuracao] Salvo com SUCESSO".green);
      }
    });
    callback();
  }

  function salvarApuracao(ap) {
    NovaApuracao.create(ap).exec(function createCB(err,created){
      console.log('Created user with name '+created.lote);
    });

    return ap;
  }

  /**
   * Calcula o valor a ser recuperado aplicando as alicotas de PIS/Confins de acordo com o tipo de  informado
   * @param valor
   * @returns {{pis: *, cofins: *, total: *}}
   */
  function calculaCredito(valor,vPIS, vCOFINS){
    var DARF = BigNumber(vPIS + vCOFINS);

    var retorno = {
      pis: valor.times(BigNumber(vPIS)).toString(),
      cofins: valor.times(BigNumber(vCOFINS)).toString(),
      total: valor.times(DARF).toString()
    };
    return retorno;
  }

  /**
   * Cria novo Objeto ApuracaocriarApuracao
   * @param cnpj
   * @param dataEmissao
   * @param lote
   * @returns {{cnpj: *, ano: *, trimestre: *, mes: *, lote: *, qtdNotas: number, iCMS: (*|exports), iCMSCorrigido: (*|exports), juros: (*|exports), creditoAtualizado: (*|exports), frete: (*|exports), valorTotal: (*|exports)}}
   */
  function criarApuracao(cnpj, nome, dataEmissao, lote) {
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
      creditoBruto:{
        pis:BigNumber(0),
        cofins:BigNumber(0),
        total:BigNumber(0)
      },
      creditoAtualizado:{
        pis:BigNumber(0),
        cofins:BigNumber(0),
        total:BigNumber(0)
      },
      creditoVirtual:{
        pis:BigNumber(0),
        cofins:BigNumber(0),
        total:BigNumber(0)
      }
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
