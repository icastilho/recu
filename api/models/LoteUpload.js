var Enum = require('enum');
module.exports = {
  attributes: {
    nome: {
      type: 'string',
      unique: true,
      required: true
    },
    notas: 'array',
    chavesDuplicadas: 'array',
    arquivo: 'binary',
    total: 'float',
    totalCredito: 'integer',
    totalCancelamento: 'integer',
    totalRemessa: 'integer',
    naoSaoNotas: 'integer',
    duplicadas: 'integer',
    outros: 'integer',
    status: 'string'
  },

  beforeDestroy: function (criteria, callback) {
    console.log("[Lote] removido com SUCESSO!".green)
    LoteUpload.findOne(criteria.where.id, function(err, loteUpload) {

      NotaFiscalJson.destroy({lote: loteUpload.nome}, function(err, nfj) {
        if (err) return callback(err);
      });

      NotaFiscal.destroy({lote: loteUpload.nome}, function(err, nf) {
        if (err) return callback(err);
        console.log("[Nota Fiscal] removido com SUCESSO!".green)
        callback();
      });

    });

  },

  LoteStatus: new Enum(['NOVO', 'PROCESSADO', 'ERRO', 'PROCESSANDO'])

};
