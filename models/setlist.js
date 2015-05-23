var mongoose = require('mongoose');
var songSchema = require('./song').songSchema;

var setlistSchema = new mongoose.Schema({
  name: String,
  date: Date,
  songs: [songSchema]
});

var Setlist = mongoose.model('Setlist', setlistSchema);

module.exports = Setlist;
