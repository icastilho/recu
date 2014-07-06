/**
 * NotaFiscalController
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
var fs = require('fs-extra')
module.exports = {


    list: function(req, res) {

        console.log(req.param("lote"));

        NotaFiscal.find({lote:req.param("lote")}).limit(100).sort('name ASC').done(function(err, notafiscals) {

            // Error handling
            if (err) {
                return console.log(err);

                // Found multiple users!
            } else {
                console.log("Notafiscal found:", notafiscals);
                return res.view({notafiscals:notafiscals});
            }
        });

    },

    /**
     * Action blueprints:
     *    `/notafiscal/parse`
     */
    load: function (req, res) {
        var nfPath = '/home/icastilho/work/others/xml/toload/';
        var nfLoadedPath = '/home/icastilho/work/others/xml/loaded/';
        var lote = 'lote01';
        fs.readdir(nfPath, function(err, files) {
            var i = 0;
            files.forEach(function (filename) {
                console.log(filename);

                var xml2js = require('xml2js');
                var parser = new xml2js.Parser({attrkey:'attr'});

                fs.readFile(nfPath + filename, function(err, data) {
                    console.log('Read file ',filename );

                   //TODO verificar se é realmente um arquivo
                    if(filename.substring(filename.length-4)=='.xml') {

                        parser.parseString(data, function (err, parsed) {
                            console.log('parse file done!', filename);
                            console.dir(parsed);
                            parsed.lote = lote;
                            console.log(parsed.lote)
                            //TODO verificar se a nota já nao foi carregada

                            //Salva a nota no banco de dados
                            NotaFiscal.create(parsed).done(function (err, notafiscal) {
                                console.log('create done')
                                // Error handling
                                if (err) {
                                    return console.log(err);

                                    // The Notafiscal was created successfully!
                                } else {
                                    console.log("Notafiscal created:", notafiscal);
                                }
                            });

                            // Verifica se o diretorio  das notas carregadas exite
                            fs.ensureDir(nfLoadedPath, function (err) {
                                if (err) return console.error(err);

                                //move a nota para o diretorio de notas carregadas
                                fs.move(nfPath + filename, nfLoadedPath + filename, function (err) {
                                    if (err) return console.error(err);
                                    console.log("Move a nota para o diretorio de notas carregadas ", filename)
                                });
                            })

                        });
                    }else{
                        console.log('Nao é XML', filename);
                    }
                });
                i++;
                console.log(i);
            });
            console.log('Load Notafiscal Done! ');
            console.log(i,' Notas Loaded');
            res.json({loaded:i});
        });
    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to NotaFiscalController)
   */
  _config: {}

  
};
