var Enum = require('enum');
module.exports = {

   attributes: {
      cnpj: "string",
      nome: "string",
      ano: "integer",
      trimestre: "integer",
      mes: "string",
      lote: "string",
      iCMS: "string",
      iCMSCorrigido: "string",
      juros: "string",
      frete: "string",
      valorTotal: "string",
      qtdNotas: "integer"

   },

   removerApuracoesDo: function (lote) {
      return Apuracao.destroy({lote: lote});
   }

};
