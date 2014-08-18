module.exports = function (req, res, next) {
   const msg = 'Você não tem permissão para executar essa ação!';

   if (req.isAuthenticated()) {
      if (req.user.token === req.cookies.ua_session_token)
         return next();
      else
         req.logout();
   }

   if (req.cookies.ua_session_token)
      new sails.config.authenticator(req, res, next).authenticate();
   else
      return res.forbidden(msg);
};
