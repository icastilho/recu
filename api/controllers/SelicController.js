var SelicService = require('../services/SelicService.js')
var moment = require('moment');
var BigNumber = require('bignumber.js');
var service = new SelicService();
moment.lang('pt');
var SelicController = {

	consultar: function(req, res){
        var data = moment(req.param('data'), "DD/MM/YYYY").format();
        data = new Date(data);
        var valor = BigNumber(req.param('valor'));
        service.consultar(data, valor, function(valorAtualizado){
            res.send({
                dataReferencia: moment().format('l'),
                valor: valorAtualizado.toString()
            });
        })
	},

    atualizar: function(req, res){
        service.atualizarSelic();

        res.send(200);
    }
}

module.exports = SelicController;