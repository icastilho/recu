var passport = require('passport'),
    UserAppStrategy = require('passport-userapp').Strategy,
    S = require('string'),
    users = []    ;

// Passport session setup
passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  var user = null;
  users.forEach(function (userIn) {
    if (userIn.username == username)
       user = userIn;
  });

  if (user === undefined) {
    done(new Error('No user with username "' + username + '" found.'));
  } else {
    done(null, user);
  }
});

// Use the UserAppStrategy within Passport
passport.use(
    new UserAppStrategy(
        { appId: '53cee64a3d39e' },
        function (userprofile, done) {
          process.nextTick(function () {
            var exists = false;

             users.forEach(users, function (user) {
                if (user.id == userprofile.id)
                   exists = true;
             });

            if (!exists) {
              users.push(userprofile);
            }

            return done(null, userprofile);
          });
        }
    ));

module.exports = {
  express: {
    customMiddleware: function (app) {
      app.use(passport.initialize());
      app.use(passport.session());
    }
  }
};
