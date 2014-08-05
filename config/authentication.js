var passport = require('passport'),
    _ = require('underscore'),
    UserAppStrategy = require('passport-userapp').Strategy,
    S = require('string'),
    users = [],
    scribe = require('scribe');

// Passport session setup
passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  var user = _.find(users, function (user) {
    return user.username == username;
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
            var exists = _.any(users, function (user) {
              return user.id == userprofile.id;
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
      app.get('/log', scribe.express.controlPanel());
    }
  }
};