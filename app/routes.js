
// app/routes.js
var Twit = require('twit');
var fs = require('fs');

var T = new Twit({
  consumer_key:         'GVGFehgqUqsuzfIpe2P7dOLmT',
  consumer_secret:      'tF42Km2XAuAZwwKJuDKVb0apTDGqhF0PoTQyltkpwNDEnHTdFN',
  access_token:         '909344142-3SQG4FZXxPwtSQqqA441AvSFK6AGLj9gXyJZnqwd',
  access_token_secret:  'e18ZT4khaW6vei1VIM2ifYpJBQepkZJ2UzyE3LwjrDeuE',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var Like    = require("../app/models/likes");
var Retweet = require("../app/models/retweets");

module.exports = function(app, passport) {

    // route for home page
    app.get('/', function(req, res) {
      res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/profile/:type', isLoggedIn, function(req, res) {

      var type = req.params.type;
      if(type == 1) {
        T.get('statuses/home_timeline', {  screen_name: req.user.screen_name }, function(err, data, response) {
          Like.find({user_id: req.user.user_id}, function(err, likes) {
            console.log(likes);
            res.render('profile.ejs', {
              user: req.user,
              timeline: data,
              type: 'Chronological',
              likes: likes
            });
          });
        })
      } else {
        T.get('statuses/home_timeline', {  screen_name: req.user.screen_name }, function(err, data, response) {
          res.render('profile.ejs', {
            user: req.user,
            timeline: data,
            type: 'Algorithmic'
          });
        })
      }
    });

    app.post('/tweet', isLoggedIn, function(req, res) {
      var status = req.body.status;
      T.post('statuses/update', { status: status }, function(err, data, response) {
        console.log(data);
      })
    });

    app.post('/like', isLoggedIn, function(req, res) {
      console.log(req.body.id);
      T.post('favorites/create', { id: req.body.id }, function (err, data, response) {
        //console.log(data["user"]["id"]);
        var newLike = new Like();
        newLike.user_id = req.user.screen_name;
        newLike.tweet_id = req.body.id;
        newLike.tweeter_id = data["user"]["id"];
        newLike.save(function(err) {
            if (err)
                throw err;
            console.log("Liked and Saved for later!")
            //return res.redirect('/profile/1');
        });
      })
    });

    app.post('/retweet', isLoggedIn, function(req, res) {
      console.log(req.body.id);
      T.post('statuses/retweet/:id', { id: req.body.id }, function (err, data, response) {
        var newRetweet = new Retweet();
        newRetweet.user_id = req.user.screen_name;
        newRetweet.tweet_id = req.body.id;
        newRetweet.tweeter_id = data["user"]["id"];
        newRetweet.save(function(err) {
            if (err)
                throw err;
            console.log("Retweeted and Saved for later!")
            //return res.redirect('/profile/1');
        });
      })
    });

    app.get('/:screen_name/followers', function(req, res) {
      var screen_name = req.params.screen_name;

      T.get('followers/list', { screen_name: screen_name, count: 200 },  function (err, data, response) {
        console.log(data);
        res.render('followers.ejs', {
          screen_name: screen_name,
          followers: data.users
        });
      })
    });

    app.get('/:screen_name/friends', function(req, res) {
      var screen_name = req.params.screen_name;

      T.get('friends/list', { screen_name: screen_name, count: 200 },  function (err, data, response) {
        console.log(data);
        res.render('friends.ejs', {
          screen_name: screen_name,
          friends: data.users
        });
      })
    });

    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile/1',
            failureRedirect : '/'
        })
    );
};


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    return next();

  res.redirect('/');
}
