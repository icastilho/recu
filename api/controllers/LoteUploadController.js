/**
 * LoteUploadController
 *
 * @module      :: Controller
 * @description   :: Lista os lotes que foram enviados via upload
 *
 */

module.exports = {

   view: function (req, res) {
      LoteUpload
         .find()
         .limit(20)
         .exec(function (err, lotes) {
            if (err)
               return console.log(err);
            else
               res.json({lotes: lotes});
         });
   },

   /**
    * Overrides for the settings in `config/controllers.js`
    * (specific to LoteUploadController)
    */
   _config: {}


};
