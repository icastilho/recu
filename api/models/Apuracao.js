/**
 * Apuracao
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	cnpj:"string",
    ano:"integer",
    trimestre: "integer",
    mes:"integer",
    lote: "string",
    iCMS: "string",
    iCMSCorrigido: "string",
    recuperar: "string",
    frete: "string",
    valorTotal: "string",
    qtdNotas: "integer"

  	/* e.g.
  	nickname: 'string'
  	*/
    
  }



};
