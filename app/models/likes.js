// app/models/likes.js
// Get dependencies

var mongoose = require('mongoose');

var likesSchema = mongoose.Schema({
  user_id: [Number],
  tweet_id: [Number],
  tweeter_id: [Number]
});

module.exports = mongoose.model('Like', likesSchema);
