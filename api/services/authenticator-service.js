var passport = require('passport');

function AuthenticatorService(req, res, next) {

  this.authenticate = function() {

      passport.authenticate('userapp', function(err, user, info) {
        if (err)
          return next(err);

        if (!user)
          return res.forbidden("Não possui Permissão de Acesso");

        req.logIn(user, function(err) {
          if (err)
            return next(err);

          return next();
        });

      })(req, res, next);

  }

}

module.exports = AuthenticatorService;