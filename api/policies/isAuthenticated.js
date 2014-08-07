module.exports = function(req, res, next) {

//   req.user.permissions.admin.value


  if (req.isAuthenticated())
    return next();

  if (req.cookies.ua_session_token)
    new sails.config.authenticator(req, res, next).authenticate();
  else
    return res.forbidden('You are not permitted to perform this action.');
};
