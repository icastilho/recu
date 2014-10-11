/**
 * NotaFiscalController
 *
 * @module      :: Controller
 * @description    :: A set of functions called `actions`.
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
var UploadJob = require("../services/UploadJob.js"),
    S = require('string'),
    moment = require('moment');
    moment.lang('pt');

module.exports = {

    /**
     * Action blueprints:
     *    `/notafiscal/upload`
     */
    upload: function (req, res) {
        console.log("Upload NotaFiscal")
        req.file('file').upload({
            saveAs: function (__newFileStream,cb) {
              var filename = __newFileStream.filename.replace('.', '-') + '-' + moment().millisecond();
              cb(null, filename);
            },
            maxBytes: 100000000
          },
          function (err, files) {
            if (err)
                return res.serverError(err);

            new UploadJob().processarArquivos();
            res.json({process: 'received upload:'});
        });

    },

    /**
     * Action blueprints:
     *    `/notafiscal/forceUpload`
     */
    forceUpload: function (req, res) {
        console.log("forceupload")
        new UploadJob().processarArquivos();
    },
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to NotaFiscalController)
     */
    _config: {}


};
