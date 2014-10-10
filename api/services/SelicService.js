var request = require('request');
var math = require('mathjs');
var split = require('split');
var moment = require('moment');
var async = require('async');
var BigNumber = require('bignumber.js');
var selicAcumulado = require('memory-cache');

function SelicService() {

  function calcularAtualizacao(valor, data) {
    var valorAcumulado = selicAcumulado.get(data);
    var i = 1;

    //Caso seja um dia sem selic Feriados etc, pega do dia anterior
    while (valorAcumulado == undefined) {
      valorAcumulado = selicAcumulado.get(moment(data).subtract(i, 'days').toDate());
      i++;
      if (i > 4)
        return valor.round(2);
    }

    valor = valor.times(valorAcumulado);
    return valor.round(2);
  }

  this.cachearSelic = function () {
    selicAcumulado.clear();
    Selic.find().sort('data desc').exec(function (err, selics) {
      var acumulado = BigNumber(1);

      selics.forEach(function (selic) {
        if (selic.fatorDiario > 0)
          acumulado = acumulado.times(selic.fatorDiario);

        selicAcumulado.put(selic.data, acumulado);
      });
    });
  };

  this.consultar = function (data, valor, callback) {
    if (selicAcumulado.size() == 0) {
      this.cachearSelic();
      callback(calcularAtualizacao(valor, data))
    } else {
      callback(calcularAtualizacao(valor, data));
    }
  }

  this.atualizarSelic = function () {
    var self = this;
    var data = {
      dataInicial: moment().subtract('years', 10).startOf('year').format('l'),
      dataFinal: moment().format('l'),
      method: 'listarTaxaDiaria',
      tipoApresentacao: 'arquivo',
      Submit: 'Consultar'
    };

    console.log(data);

    Selic.destroy({}).exec(function (err) {
      if (err)
        console.log(err);
    });

    request.post('http://www3.bcb.gov.br/selic/consulta/taxaSelic.do', {form: data}).pipe(split()).on('data', function (line) {
      var split = line.split(';');

      if (split[1] == undefined) {
        return;
      }

      var taxa = parseFloat(split[1].replace(',', '.'));
      var fatorDiario = parseFloat(split[2].replace(',', '.'));

      var selic = {
        data: moment(split[0], 'DD/MM/YYYY').format(),
        taxa: math.round(taxa, 3),
        fatorDiario: fatorDiario
      };

      Selic.create(selic).exec(function (err, user) {
        if (err) {
          return console.log(err);
        } else {
          console.log("Selic created:", user);
        }
      });
    })
      .on('end', function (){
        console.log("Fim atualização selic")
        self.cachearSelic();
      });
  }
}

module.exports = new SelicService;
