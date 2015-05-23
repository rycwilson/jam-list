var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jam_list');

// here index.js is acting as a go-between
module.exports.User = require('./user');
module.exports.Song = require('./song').Song;
module.exports.Setlist  = require('./setlist');


