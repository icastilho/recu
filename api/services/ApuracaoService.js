/**
 * Created by icastilho on 01/08/14.
 */

var BigNumber = require('bignumber.js');
var SelicService = require('./SelicService.js');
var selicService = new SelicService();

function ApuracaoService() {

    this.apurar = function (loteName) {
//        loteName = '1827-shr3hm.zip';
        LoteUpload.find({nome: '/var/folders/f5/2l519w0x1hv39y317bjm8z380000gn/T/'+loteName}).limit(10)
            .sort('notas.nfeProc.NFe.infNFe.ide.dEmi ASC').exec(function (err,lotes) {
                // Error handling
                if (err) {
                    return console.log(err);
                } else {
                    if(lotes.length>0) {
                        console.log(lotes[0].notas)
                        run(lotes[0].notas, lotes[0].nome);

                    }else{
                        console.log("Nenhuma nota encontrada")
                    }
                }
            });
    }

}
module.exports = ApuracaoService;

function run(notas, lote){
    console.log("Runing...")
    console.log(notas)
    var dataEmi = parseToDate(notas[0].nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);

    var apuracao = createApuracao( notas[0].nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0], dataEmi, lote);

    notas.forEach(function(nota){
        var cnpj = nota.nfeProc.NFe[0].infNFe[0].emit[0].CNPJ[0];
        if(cnpj != apuracao.cnpj){
            console.error("CNPJ diferente encontrado no Lote", cnpj)
            //TODO implementar tratamento para CNPJ diferentes econtrados
        }else{
            var dataEmissao = parseToDate(nota.nfeProc.NFe[0].infNFe[0].ide[0].dEmi[0]);
            var ano = dataEmissao.getFullYear();
            if( apuracao.ano == ano){
                var trimestre = getTrimestre(dataEmissao);
                if(apuracao.trimestre==trimestre){
                    var icms = nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0];
                    apuracao.valorTotal = apuracao.valorTotal.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vNF[0]);
                    apuracao.frete =  apuracao.frete.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vFrete[0]);
                    apuracao.icms = apuracao.icms.plus(nota.nfeProc.NFe[0].infNFe[0].total[0].ICMSTot[0].vICMS[0]);
                    apuracao.qtdNotas++;

                    selicService.consultar(dataEmissao,icms,function(valor){
                        console.log("icms:",icms," corrigido:", valor)
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
        ano: dataEmissao.getFullYear(),
        trimestre: getTrimestre(dataEmissao),
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
    var date = new Date(sdate+" 00:00:00");
    return date
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