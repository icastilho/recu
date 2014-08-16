var moment = require('moment');
var BigNumber = require('bignumber.js');
moment.lang('pt');

var SelicController = {

   consultar: function (req, res) {
      var data = moment(req.param('data'), "DD/MM/YYYY").format();
      data = new Date(data);
      var valor = BigNumber(req.param('valor'));
      SelicService.consultar(data, valor, function (valorAtualizado) {
         res.send({
            dataReferencia: moment().format('l'),
            valor: valorAtualizado.toString()
         });
      })
   },

   atualizar: function (req, res) {
      SelicService.atualizarSelic();

      res.send(200);
   }
}

module.exports = SelicController;