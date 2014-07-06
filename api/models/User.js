/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    permissoes: {
        type: 'array',
        Permissao: {
            name:'string',
            value:'boolean'
        }
    }
  	/* e.g.
  	nickname: 'string'
  	*/
    
  }

};
