/**
 * ApuracaoController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

   /**
    * Dispara o processo de Apuracao do lote
    * @param req
    * @param res
    */
    apurar: function(req, res) {
        console.log("Start Apuracao lote:...", req.param("lote"))

        new ApuracaoService().apurar(req.param("lote"));

        res.json({status:"Processando..."});

    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ApuracaoController)
   */
  _config: {}

  
};
