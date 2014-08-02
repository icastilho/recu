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

var fs = require('fs-extra');
var util = require('util');
var Q = require('q');
var UploadService = require('../services/UploadService.js')

function getTrimestre(trimestre) {

    if (trimestre == 1) {
        return { '>=': "2010-01-01", '<': "2010-04-01" };
    } else if (trimestre == 2) {
        return { '>=': "2010-04-01", '<': "2010-06-01" };
    } else if (trimestre == 3) {
        return { '>=': "2010-06-01", '<': "2010-09-01" };
    } else if (trimestre == 4) {
        return { '>=': "2010-09-01", '<': "2010-12-01" };
    }
}

module.exports = {


    list: function (req, res) {
        var lote = req.param("lote");
        var trimestre = req.param("trimestre");
        var ano = req.param("ano");
        var q = {'nfeProc.NFe.infNFe.ide.dEmi': getTrimestre(trimestre), lote: lote };
        var qAno = {'nfeProc.NFe.infNFe.ide.dEmi': {startsWith: ano}};
        console.log(q);
        NotaFiscal.find(qAno)
            .where(q)
            .limit(10).sort('nfeProc.NFe.infNFe.ide.dEmi ASC').done(function (err, notafiscals) {

                // Error handling
                if (err) {
                    return console.log(err);

                    // Found multiple users!
                } else {
                    console.log("Notafiscal found:", notafiscals);
                    return res.view({notafiscals: notafiscals});
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
        var lote = req.param("lote");
        fs.readdir(nfPath, function (err, files) {
            var i = 0;
            var duplicada = 0;
            var cancelamento = 0;
            files.forEach(function (filename) {
                console.log(filename);

                var xml2js = require('xml2js');
                var parser = new xml2js.Parser({attrkey: 'attr'});

                fs.readFile(nfPath + filename, function (err, data) {
                    console.log('Read file ', filename);

                    //TODO verificar se é realmente um arquivo
                    if (filename.substring(filename.length - 4) == '.xml') {

                        parser.parseString(data, function (err, parsed) {
                            console.log('parse file done!', filename);
                            console.dir(parsed);
                            parsed.lote = lote;
                            parsed.nome = filename;
                            console.log(parsed.lote);
                            console.log(parsed.nfeProc);
                            if (parsed.nfeProc == undefined) {
                                cancelamento++;
                                console.log("nota nao contem conteudo, provavelmente é cancelamento")
                            } else {
                                //verificar se a nota já nao foi carregada
                                NotaFiscal.findOne(
                                    {'nfeProc.NFe.infNFe.attr.Id': parsed.nfeProc.NFe[0].infNFe[0].attr.Id}
                                ).done(function (err, notafiscals) {
                                        if (err) {
                                            return console.log(err);
                                        } else {
                                            console.log("Notafiscal found:", notafiscals);
                                            if (notafiscals == undefined) {
                                                i++;
                                                //Salva a nota no banco de dados
                                                NotaFiscal.create(parsed).done(function (err, notafiscal) {
                                                    console.log('create Notafiscal done')
                                                    // Error handling
                                                    if (err) {
                                                        return console.log(err);

                                                        // The Notafiscal was created successfully!
                                                    } else {
                                                        console.log("Notafiscal created:", notafiscal);
                                                    }
                                                });

                                            } else {
                                                duplicada++;
                                            }
                                            return res.view({notafiscals: notafiscals});
                                        }
                                    });
                            }

                            // Verifica se o diretorio  das notas carregadas exite
                            fs.ensureDir(nfLoadedPath, function (err) {
                                if (err) return console.error(err);

                                //move a nota para o diretorio de notas carregadas
                                fs.move(nfPath + filename, nfLoadedPath + lote + '/' + filename, function (err) {
                                    if (err) return console.error(err);
                                    console.log("Move a nota para o diretorio de notas carregadas ", filename)
                                });
                            })

                        });

                    } else {
                        console.log('Nao é XML', filename);
                    }
                });
                console.log(i);
            });
            console.log('Load Notafiscal Done! ');
            console.log(i, ' Notas Loaded');
            console.log(duplicada, ' Notas Duplicadas');
            console.log(cancelamento, 'Cancelamento')

            res.json({loaded: i, duplicadas: duplicada, cancelamento: cancelamento});
        });
    },


    /**
     * Action blueprints:
     *    `/notafiscal/upload`
     */
    upload: function (req, res) {
        var service = new UploadService();

        Q.fcall(service.upload(req.files.file)
            .then(function(){
            res.json({process: 'received upload:'});
        }));
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to NotaFiscalController)
     */
    _config: {}


};
