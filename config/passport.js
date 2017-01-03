// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var User       = require('../app/models/user');

var configAuth = require('./auth');

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  // Twitter Login
  passport.use(new TwitterStrategy({

    consumerKey    : configAuth.twitterAuth.consumerKey,
    consumerSecret : configAuth.twitterAuth.consumerSecret,
    callbackURL    : configAuth.twitterAuth.callbackURL

  },
  function(token, tokenSecret, profile, done) {

    // make code asynchronous
    process.nextTick(function() {

      User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

        if(err)
          return done(err);

        if(user) {
          return done(null, user); //User found, return
        } else {
          // create new user if doesn't exist
          var newUser                 = new User();

          // set all of the user data that we need
          newUser.twitter.id          = profile.id;
          newUser.twitter.token       = token;
          newUser.twitter.username    = profile.username;
          newUser.twitter.displayName = profile.displayName;

          // save our user into the database
          newUser.save(function(err) {
              if (err)
                  throw err;
              return done(null, newUser);
          });
        }
      });
    });
  }));
}
