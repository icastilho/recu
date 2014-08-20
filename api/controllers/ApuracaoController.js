module.exports = {

   /**
    * Dispara o processo de Apuracao do lote
    * @param req
    * @param res
    */
   apurar: function (req, res) {

      LoteUpload
         .findOne(req.param("id"))
         .then(
            function(lote) {
               console.info("Start Apuracao lote:...", lote.nome);
               var regime = Apuracao.Regime.get(req.param("regime"));
               ApuracaoService
                  .apurar(lote, regime)
                  .then(function (lote) {
                     res.json(lote);
                  });
            },
            function(error) {
               res.badRequest(error);
            }
         );
   },


   /**
    * Overrides for the settings in `config/controllers.js`
    * (specific to ApuracaoController)
    */
   _config: {}


};
