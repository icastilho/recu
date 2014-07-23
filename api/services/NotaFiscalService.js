var BigNumber = require('bignumber.js');

module.exports = {

    processar: function (loteName) {
        NotaFiscal.find({lote: loteName}).limit(10)
            .sort('nfeProc.NFe.infNFe.ide.dEmi ASC').done(function (err, notas) {
                // Error handling
                if (err) {
                    return console.log(err);
                } else {
                    console.log("Notafiscal found:", notas);
                    if(notas.length>0) {
                        run(notas, loteName);
                    }else{
                        console.log("Nenhuma nota encontrada")
                    }
                }
            });
    }
};

var run = function(notas, lote){
    console.log("Runing...")
    var apuracao = {
        cnpj: notas[0].nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0],
        ano: getAno(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi),
        trimestre: getTrimestre(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi),
        lote: lote,
        qtdNotas: 0,
        icms: BigNumber(0),
        iCMSCorrigido: BigNumber(0),
        frete: BigNumber(0),
        valorTotal: BigNumber(0)
    }

    console.log(apuracao)

    notas.forEach(function(nota){
        var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
        if(cnpj != apuracao.cnpj){
            console.error("CNPJ diferente encontrado no Lote", cnpj)
            //            TODO implementar tratamento para CNPJ diferentes econtrados
        }else{
            var ano = getAno(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi);
            if( apuracao.ano == ano){
                var trimestre = getTrimestre(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi);
                if(apuracao.trimestre==trimestre){
                    apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
                    apuracao.icms = apuracao.icms.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);

                    apuracao.qtdNotas++;
                }else{
                    console.log("Novo trimestre:", trimestre)
                }
            }else{
                console.log("Novo ano :", ano)
            }
        }

    });

    console.log("Finish...")
    console.log("ICMS:",apuracao.icms.toString());
    console.log(apuracao)
}

function getAno (date){
//    TODO implementar metodo que analisa a data passada e retorna o trimestre
    return 2010;
}

function getTrimestre (date){
//    TODO implementar metodo que analisa a data passada e retorna o trimestre
    return 1;
}