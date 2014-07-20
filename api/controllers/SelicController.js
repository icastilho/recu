var SelicService = require('../services/SelicService.js')
var service = new SelicService();

var SelicController = {
	
	consultar: function(req, res){

		
		var data = req.param('data'), valor = req.param('valor');

		res.send({
			data: data,
			valor: valor,
			taxa: service.consultar()
		});
	},

    atualizar: function(req, res){
        service.atualizarSelic();

        res.send(200);
    }
}

module.exports = SelicController;