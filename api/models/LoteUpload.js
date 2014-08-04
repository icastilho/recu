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
        status: 'string'
    }
};