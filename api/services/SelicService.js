var request = require('request');
var math = require('mathjs');
var split = require('split');
var moment = require('moment');

function SelicService() {

}

SelicService.prototype.consultar = function () {
    return {
        taxa: 10
    }
};

SelicService.prototype.atualizarSelic = function () {
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

        var selic = {
            data: split[0],
            taxa: math.round(taxa, 3)
        };

        Selic.create(selic).done(function (err, user) {
            if (err) {
                return console.log(err);
            } else {
                console.log("Selic created:", user);
            }
        });
    });


};

module.exports = SelicService;