var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    connFlash = require('connect-flash'),
    flash = require('express-flash'),
    ejs = require('ejs'),
    path = require('path'),
    views = path.join(__dirname, 'views'),
    db = require('./models');

// ejs templating
app.set('view engine', 'ejs');

// static content
app.use('/static', express.static('public'));
app.use('/vendor', express.static('bower_components'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
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
    console.log('req.session.userId: ', req.session.userId);
  };
  // fetches the user associated with the session
  req.getCurrentUser = function (cb) {
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

// site welcome
app.get('/welcome', function (req, res) {
  res.sendFile(path.join(views, 'welcome.html'));
});

// user#show
app.get('/users/:id', function (req, res) {
  // currentUser uses req.session.userId to identify user,
  // then sets req.user = user
  console.log('here we are');
  req.currentUser(function (err, user) {
    res.send("Welcome, " + user.email);
  });
});

app.get('/home', function (req, res) {
  // need a way to determine if user has visisted this page
  // once already during login.  Count page views in req.session
  if (req.session.userId) {
    db.User.findOne({_id: req.session.userId}, function (err, user) {
      res.render('home.ejs', { user: user.email, message: req.flash('login-ok') });
    });
  }
  else {
    res.redirect('/welcome');
  }
});

app.post('/sessions', function (req, res) {
  db.User.authenticate(req.body.user, function (err, authUser) {
    console.log('req.session (before login): ', req.session);
    if (authUser) {
      req.login(authUser);
      console.log('req.session (after login): ', req.session);
      req.flash('login-ok', 'Signed in successfully!');
      res.status(200).send(authUser);
    }
    else switch (err) {
      case 403:
        res.status(403).send('Invalid password');
        break;
      case 404:
        res.status(404).send('No account associated with this address');
    }
  });
});

app.delete('/sessions', function (req, res) {
  req.logout();
  res.status(200).send();
});

app.post('/users', function (req, res) {
  db.User.createSecure(req.body.user,
    function (err, newUser) {
      if (newUser) {
        req.login(newUser);
        console.log('Logged in user: ', newUser.email);
        res.redirect('/users/' + newUser._id);
      }
      else {  // validation(s) failed; add a flash mesg here
        res.redirect('/signup');
      }
    }
  );
});

app.get('/songs', function (req, res) {
  db.Song.find({}, function (err, songs) {
    if (err) { console.log(err); }
    res.send(songs);
  });
});

app.post('/songs', function (req, res) {
  db.Song.create({ title: req.body.song.title, artist: req.body.song.artist },
    function (err, song) {
      if (err) { return console.log(err); }
      res.send(song);
    }
  );
});

app.listen(3000, function () {
  console.log("Listening on port 3000...");
});
