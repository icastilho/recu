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

   LoteStatus : new Enum(['NOVO', 'PROCESSADO', 'ERRO', 'PROCESSANDO'])

};