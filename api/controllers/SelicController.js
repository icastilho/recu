var SelicService = require('../services/SelicService.js')
var moment = require('moment');
var service = new SelicService();

var SelicController = {
	
	consultar: function(req, res){
        var data = moment(req.param('data'), "DD/MM/YYYY").format(), valor = req.param('valor');

        service.consultar(data, valor, function(valorAtualizado){
            res.send({
                dataReferencia: moment().format('l'),
                valor: valorAtualizado
            });
        })
	},

    atualizar: function(req, res){
        service.atualizarSelic();

        res.send(200);
    }
}

module.exports = SelicController;