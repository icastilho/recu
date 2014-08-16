var request = require('request');
var math = require('mathjs');
var split = require('split');
var moment = require('moment');

function SelicService() {
   this.consultar = function (data, valor, callback) {
      Selic.find()
         .where({ data: { '>=': data}})
         .exec(function(err, selics) {
            selics.forEach(function(selic) {
               if (selic.fatorDiario > 0)
                  valor = valor.times(selic.fatorDiario)
            });

            callback(valor.round(2));
         });
   }

   this.atualizarSelic = function () {
      var data = {
         dataInicial: moment().subtract('years', 10).startOf('year').format('l'),
         dataFinal: moment().format('l'),
         method: 'listarTaxaDiaria',
         tipoApresentacao: 'arquivo',
         Submit: 'Consultar'
      };

      console.log(data);

      Selic.destroy({}).exec(function(err){
         if (err)
            console.log(err);
      });

      request.post('http://www3.bcb.gov.br/selic/consulta/taxaSelic.do', {form: data}).pipe(split()).on('data', function (line) {
         var split = line.split(';');

         if(split[1] == undefined){
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
      });
   }
}

module.exports = new SelicService;