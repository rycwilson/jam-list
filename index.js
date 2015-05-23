var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    db = require('./models'),
    path = require('path'),
    views = path.join(process.cwd(), 'views');
    app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: "super secret",
  resave: false,
  saveUnitialized: true
}));

// mount middleware function to the root route
app.use("/", function (req, res, next) {
  // create a session
  req.login = function (user) {
    req.session.userId = user._id;
  };
  // fetches the user associated with the session
  req.currentUser = function (cb) {
     db.User.
      findOne({
          id: req.session.userId
      },
      function (err, user) {
        req.user = user;
        cb(null, user);
      });
  };
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  };
  next();
});

app.get('/', function (req, res) {
  res.redirect('/login');
});

app.get("/signup", function (req, res) {
  res.send("Coming soon");
});

app.get("/login", function (req, res) {
  res.sendFile(path.join(views, "login.html"));
});

app.get('/profile', function (req, res) {
  req.currentUser(function (err, user) {
    res.send(user);
  });
});

app.post('/login', function (req, res) {
  console.log(req.body.user);
  var user = req.body.user;
  db.User.authenticate(user.email, user.password, function (err, user) {
    console.log("Logging in...");
    req.login(user);
    res.redirect('/profile');
  });
});

app.post("/users", function (req, res) {
  // grab the user from the params
  var user = req.body.user;
  // create the new user
  db.User.
    createSecure(user.email, user.password,
    function() {
      res.send("SIGNED UP!");
    });
});

app.listen(3000, function () {
  console.log("Listening on port 3000...");
});