/**
 * NotaFiscal
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    lote: 'string',
    chave: 'string',
    natOp: 'string',
    cnpj: 'string',
    pjNome: 'string',
    iCMS: 'string',
    iCMSCorrigido: 'string',
    pPIS: 'float',
    pis: 'string',
    cofins: '',
    pCOFINS: 'float',
    dataEmissao: 'string',
    juros: 'string',
    valorNF: 'string',
    valorFrete: 'string',
    tipo: 'string'
  }
};
