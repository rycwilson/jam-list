var mongoose = require('mongoose');
// mongoose.set('debug', true);

mongoose.connect(process.env.MONGOLAB_URI ||
                 process.env.MONGOHQ_URL ||
                 'mongodb://localhost/jam_list', function (error) {
  if (error) console.log(error);
});

// here index.js is acting as a go-between
module.exports.User = require('./user');
module.exports.Song = require('./song').Song;
module.exports.Setlist  = require('./setlist');
