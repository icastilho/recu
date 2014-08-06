var passport = require('passport'),
    _ = require('underscore'),
    UserAppStrategy = require('passport-userapp').Strategy,
    S = require('string'),
    users = [],
    scribe = require('scribe');

scribe.configure(function(){
   scribe.set('app', 'GFI');                     // NOTE Best way learn about these settings is
   scribe.set('logPath', './log'); // Doublecheck       // them out for yourself.
   scribe.set('defaultTag', 'DEFAULT');
   scribe.set('divider', ':::');
   scribe.set('identation', 5);                          // Identation before console messages

   scribe.set('maxTagLength', 30);                       // Any tags that have a length greather than
   // 30 characters will be ignored
});

// Create Loggers
// --------------
scribe.addLogger("log", false , true, 'white');            // (name, save to file, print to console,
scribe.addLogger('realtime', true, true, 'underline');    // tag color)
scribe.addLogger('high', true, true, 'magenta');
scribe.addLogger('normal', true, true, 'white');
scribe.addLogger('low', true, true, 'grey');
scribe.addLogger('info', true, true, 'cyan');

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