var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    connFlash = require('connect-flash'),
    flash = require('express-flash'),
    ejs = require('ejs'),
    db = require('./models'),
    path = require('path'),
    views = path.join(process.cwd(), 'views');

// ejs templating
app.set('view engine', 'ejs');

// static content
app.use('/static', express.static('public'));
app.use('/vendor', express.static('bower_components'));

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
  secret: "super secret",
  resave: false,
  saveUnitialized: true
}));
app.use(flash());

// session helpers
app.use("/", function (req, res, next) {
  // create a session
  req.login = function (user) {
    req.session.userId = user._id;
  };
  // fetches the user associated with the session
  req.currentUser = function (cb) {
    db.User.findOne({ _id: req.session.userId },
      function (err, user) {
        if (err) { return cb(err, null); }
        console.log('req.user (before assigned db user): ', req.user);
        req.user = user;
        console.log('req.user: ', req.user);
        cb(null, user);
      }
    );
  };
  // logout
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  };
  next();
});

app.get('/', function (req, res) {
  console.log('req.session (root request): ', req.session);
  res.redirect('/welcome');
});

// welcome page
app.get('/welcome', function (req, res) {
  res.sendFile(path.join(views, 'welcome.html'));
});

app.get('/logout', function (req, res) {
  console.log('logging out...');
  req.logout();
  res.redirect('/login');
});

// user#show
app.get('/user/:id', function (req, res) {
  // currentUser uses req.session.userId to identify user,
  // then sets req.user = user
  console.log('here we are');
  req.currentUser(function (err, user) {
    res.send("Welcome, " + user.email);
  });
});

app.get('/songs', function (req, res) {
  // need a way to determine if user has visisted this page
  // once already during login.  Count page views in req.session
  if (req.session.userId) {
    db.User.findOne({_id: req.session.userId}, function (err, user) {
      res.render('songs.ejs', {user: user.email, message: req.flash('login-ok')});
    });
  }
  else res.redirect('/login');
});

app.post('/login', function (req, res) {
  var user = req.body.user;
  db.User.authenticate(user, function (err, authUser) {
    if (err) {
      return res.status(500).send(err);
    }
    console.log('req.session (before login): ', req.session);
    console.log("Logging in...");
    req.login(authUser);
    console.log('req.session (after login): ', req.session);
    req.flash('login-ok', 'Signed in successfully!');
    res.redirect('/songs');
  });
});

app.post('/users', function (req, res) {
  db.User.createSecure(req.body.user,
    function (err, newUser) {
      if (newUser) {
        req.login(newUser);
        console.log('Logged in user: ', newUser.email);
        res.redirect('/user/' + newUser._id);
      }
      else {  // validation(s) failed; add a flash mesg here
        res.redirect('/signup');
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Listening on port 3000...");
});
