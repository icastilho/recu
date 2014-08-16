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
      creditoBruto: "string",
      creditoAtualizado: "string",
      creditoVirtual: "string",
      frete: "string",
      valorTotal: "string",
      qtdNotas: "integer"
   },

   removerApuracoesDo: function (lote) {
      return Apuracao.destroy({lote: lote});
   }

};
