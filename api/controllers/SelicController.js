var SelicService = require('../services/SelicService.js')
var moment = require('moment');
var service = new SelicService();

var SelicController = {
	
	consultar: function(req, res){

		
		var data = moment(req.param('data'), "DD/MM/YYYY").format(), valor = req.param('valor');

        Selic.find()
            .where({ data: { '>': data}})
            .sort('data')
            .exec(function(err, selics) {
                _.each(selics, function(selic, i) {
                    if(selic.fatorDiario > 0){
                        valor = valor * selic.fatorDiario
                    }

                });

                console.log(selics.length);

                res.send({
                    data: data,
                    valor: valor,
                    taxa: service.consultar()
                });
            });

	},

    atualizar: function(req, res){
        service.atualizarSelic();

        res.send(200);
    }
}

module.exports = SelicController;