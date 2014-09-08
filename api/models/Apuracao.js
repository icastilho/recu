var Enum = require('enum');
module.exports = {

   attributes: {
      cnpj: "string",
      ano: "integer",
      trimestre: "integer",
      mes: "string",
      lote: "string",
      iCMS: "string",
      iCMSCorrigido: "string",
      juros: "string",
   /*   creditoBruto: {
         pis: "string",
         cofins: "string",
         total: "string"
      },
      creditoAtualizado: {
         pis: "string",
         cofins: "string",
         total: "string"
      },
      creditoVirtual: {
         pis: "string",
         cofins: "string",
         total: "string"
      },*/
      frete: "string",
      valorTotal: "string",
      qtdNotas: "integer",
      regime: "string"

   },

   removerApuracoesDo: function (lote) {
      return Apuracao.destroy({lote: lote});
   },

   Regime: new Enum({'CUMULATIVO':{pis:0.005, cofins:0.03},'NAO_CUMULATIVO':{pis:0.0165, cofins:0.076}, 'DIFERENCIADO':{}})
};
