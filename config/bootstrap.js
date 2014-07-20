/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var CronJob = require('cron').CronJob;
var SelicService = require('../api/services/SelicService.js');
var service = new SelicService();
var moment = require('moment');

module.exports.bootstrap = function (cb) {
    moment.lang('pt');

    new CronJob('0 0 7 * * *', function(){
        console.log("Atualizando Selic");
        service.atualizarSelic();
    }, null, true, "America/Sao_Paulo");

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};