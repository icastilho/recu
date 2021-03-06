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
               ApuracaoService
                  .apurar(lote)
                  .then(function (lote) {
                     res.json(lote);
                  });
            },
            function(error) {
               res.badRequest(error);
            }
         );
   },

    corrigir: function (req, res) {
        LoteUpload
            .findOne(req.param("id"))
            .then(
                function(lote) {
                    console.info("Start Correcao ICMS lote:...", lote.nome);
                    ApuracaoService.corrigir(lote)
                        .then(function (result) {
                            res.json({status:result});
                        });
            });
    },
   /**
    * Overrides for the settings in `config/controllers.js`
    * (specific to ApuracaoController)
    */
   _config: {}


};
