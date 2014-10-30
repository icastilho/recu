/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var UploadJob = require("../api/services/UploadJob.js");
var CronJob = require('cron').CronJob;
var moment = require('moment');
var colors = require('colors');
var BigNumber = require('bignumber.js');

module.exports.bootstrap = function (cb) {

   moment.lang('pt');
   var upload = new UploadJob();


   new CronJob('0 0 5 * * *', function () {
      console.info("Atualizando Selic... ".green);

      SelicService.atualizarSelic();
   }, null, true, "America/Sao_Paulo");

   SelicService.consultar(new Date(), BigNumber(100),function(valor){})
   // It's very important to trigger this callback method when you are finished
   // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
   cb();
};
