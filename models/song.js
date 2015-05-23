var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  genre: String
});

var Song = mongoose.model('Song', songSchema);

module.exports.Song = Song;
module.exports.songSchema = songSchema;
