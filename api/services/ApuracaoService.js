/**
 * Created by icastilho on 01/08/14.
 */

var BigNumber = require('bignumber.js');
var moment = require('moment');
moment.lang('pt');

function ApuracaoService() {

    this.apurar = function (loteName) {
        LoteUpload.find({nome: loteName}).limit(10)
//        NotaFiscal.find().where({lote: loteName}).limit(10)
            .sort('notas.nfeProc.NFe.infNFe.ide.dEmi ASC').exec(function (err,lote) {
                // Error handling
                if (err) {
                    return console.log(err);
                } else {
                    if(lote.length>0) {
                        run(lote[0].notas, lote[0].nome);

                    }else{
                        console.log("Nenhuma nota encontrada")
                    }
                }
            });
    }

}


function run(notas, lote){
    console.log("Runing...")

    notas.sort(notasCompare)

    var dataEmi = parseToDate(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
    var apuracao = createApuracao( notas[0].nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0], dataEmi, lote);


    notas.forEach(function(nota){
        var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
        if(cnpj != apuracao.cnpj){
            console.error("CNPJ diferente encontrado no Lote", cnpj)
            //TODO implementar tratamento para CNPJ diferentes econtrados
        }else{
            var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
            var ano = dataEmissao.year();
            if( apuracao.ano == ano){
                var trimestre = dataEmissao.quarter();
                if(apuracao.trimestre==trimestre){
                    var icms = BigNumber(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
                    apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
                    apuracao.frete =  apuracao.frete.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]);
                    apuracao.icms = apuracao.icms.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
                    apuracao.qtdNotas++;
                    new SelicService().consultar(new Date(dataEmissao),icms,function(valor){
                        console.log("icms:",icms.toString()," corrigido:", valor.toString())
                        //TODO Isso aqui vai dar merda?
                        apuracao.iCMSCorrigido = apuracao.iCMSCorrigido.plus(valor);
                    });
                }else{
                    saveApuracao(apuracao);
                    console.log("Novo trimestre:", trimestre)
                    apuracao = createApuracao(apuracao.cnpj,dataEmissao,lote);
                }
            }else{
                saveApuracao(apuracao);
                console.log("Novo ano :", ano)
                apuracao = createApuracao(apuracao.cnpj,dataEmissao,lote);
            }
        }

    });

    console.log("Finish...")
    saveApuracao(apuracao);
}


function saveApuracao(apuracao){
    console.log("CNPJ:",apuracao.cnpj);
    console.log("trimestre:",apuracao.trimestre);
    console.log("ICMS:",apuracao.icms.toString());
    console.log("iCMSCorrigido:",apuracao.iCMSCorrigido.toString());
    console.log("frete:",apuracao.frete.toString());
    console.log("valorTotal:",apuracao.valorTotal.toString());
    console.log("ICMS muliply :",apuracao.icms.times(3.65).toString());

   /* Apuracao
        .create(apuracao)
            .done(function (err, apuracao) {
                console.log('create Apuracao done')
                // Error handling
                if (err) {
                    return console.log(err);
                    // The Apuracao was created successfully!
                } else {
                    console.log("Apuracao created successfully:", apuracao);
                }
            });*/

}

function createApuracao(cnpj, dataEmissao, lote){
    return apuracao = {
        cnpj: cnpj,
        ano: dataEmissao.year(),
        trimestre: dataEmissao.quarter(),
        lote: lote,
        qtdNotas: 0,
        icms: BigNumber(0),
        iCMSCorrigido: BigNumber(0),
        frete: BigNumber(0),
        valorTotal: BigNumber(0)
    }

}

/**
 * Transforma o string 'yyyy-mm-dd' em data
 * @param sdate
 * @returns {Date}
 */
function parseToDate(sdate){
    console.log(sdate)
    var date = moment(sdate, "YYYY-MM-DD");
    return date.compa
}

/**
 * Retorna o trimestre referente a data passada.
 * @param month
 * @returns {Number}
 */
function getTrimestre (date){
    var trimestre = new Number(0);
    trimestre = parseInt(date.getMonth()/3+1);
    return trimestre;
}

function notasCompare(a, b){
    a = parseToDate(a.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
    b = parseToDate(b.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);

    if(a.isBefore(b)){
        return -1;
    }else if(a.isSame(b)){
        return 0;
    }else{
        return 1;
    }
}

module.exports = ApuracaoService;