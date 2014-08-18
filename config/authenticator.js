var passport = require('passport');

function Authenticator(req, res, next) {

  this.authenticate = function() {

      passport.authenticate('userapp', function(err, user, info) {
        if (err)
          return next(err);

        if (!user)
          return res.forbidden('Você não tem permissão para executar essa ação!');

        req.logIn(user, function(err) {
          if (err)
            return next(err);

          return next();
        });

      })(req, res, next);

  }

}

module.exports.authenticator = Authenticator;
