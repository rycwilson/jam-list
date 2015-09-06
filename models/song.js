var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    default: "none specified"
  },
  genre: {
    type: String,
    default: "none specified"
  }
});

var Song = mongoose.model('Song', songSchema);

module.exports.Song = Song;
module.exports.songSchema = songSchema;

// equivalent to
// module.exports = {
//   Song: Song;
//   songSchema: songSchema;
// }