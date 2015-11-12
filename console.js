var REPL = require("repl");
var db = require("./models");

var repl = REPL.start("jam-list > ");
repl.context.db = db;
repl.context.allSongs = allSongs;
repl.context.clearSongs = clearSongs;
repl.context.allUsers = allUsers;
repl.context.clearUsers = clearUsers;

repl.on("exit", function () {
  console.log("Goodbye");
  process.exit();
});

function allSongs () {
  db.Song.find({}, function (err, songs) {
    if (err) { return console.log(err); }
    return console.log(songs);
  });
}

function clearSongs () {
  db.Song.remove({}, function (err, songs) {
    if (err) { return console.log(err); }
    return console.log(songs);
  });
}

function allUsers () {
  db.User.find({}, function (err, users) {
    if (err) { return console.log(err); }
    return console.log(users);
  });
}

function clearUsers () {
  db.User.remove({}, function (err, users) {
    if (err) { return console.log(err); }
    return console.log(users);
  });
}