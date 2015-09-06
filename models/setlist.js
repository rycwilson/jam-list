var mongoose = require('mongoose');
var songSchema = require('./song').songSchema;

var setlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    // default: now
  },
  songs: [songSchema]
});
// above is embedded data
// referenced data would look like:
//  songs: [{
//     type: Schema.Types.ObjectId,
//     ref: 'Song'
//   }]

var Setlist = mongoose.model('Setlist', setlistSchema);

module.exports = Setlist;



