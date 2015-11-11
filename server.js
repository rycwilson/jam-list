var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    flash = require('express-flash'),
    ejs = require('ejs'),
    path = require('path'),
    views = path.join(__dirname, 'views'),
    env = require('dotenv').load(),
    oauth2 = require('simple-oauth2')({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      site: 'https://api.genius.com',
      tokenPath: '/oauth/access_token',
      authorizationPath: '/oauth/authorize'
    }),
    authorization_uri = oauth2.authCode.authorizeURL({
      redirect_uri: 'localhost:3000/callback',
      scope: 'me',
      state: '3'
      // state: '3(#0/!~'
    }),
    token,
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
    console.log('logged in, req.session.userId: ', req.session.userId);
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
  res.render('welcome.ejs', { view: 'login', data: null, status: null });
});

// sign in with genius
app.get('/auth', function (req, res) {
  console.log('/auth');
  res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'localhost:3000/callback'
  }, saveToken);

  function saveToken (error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
  }
});

// user#show
app.get('/users/:id', function (req, res) {
  // currentUser uses req.session.userId to identify user,
  // then sets req.user = user
  console.log('here we are');
  req.getCurrentUser(function (err, user) {
    if (err) { return console.log(err); }
    res.send("Welcome, " + user.email);
  });
});

app.get('/home', function (req, res) {

  if (req.session.userId) {
    // if we came here from welcome page, display a flash message
    if (req.get('Referer') === 'http://localhost:3000/welcome') {
      req.flash('success', 'Welcome back!');
    }
    db.User.findOne({_id: req.session.userId}, function (err, user) {
      res.render('home.ejs', { user: user.email });
    });
  }
  else {
    res.redirect('/welcome');
  }
});

// this route handles ajax login requests, responds with the logged in
// user or appropriate error code/message
app.post('/sessions', function (req, res) {
  db.User.authenticate(req.body.user, function (err, authUser) {
    console.log('req.session (before login): ', req.session);
    if (authUser) {
      req.login(authUser);
      console.log('req.session (after login): ', req.session);
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
  req.flash('info', 'Goodbye');
  res.status(200).send();
});

app.post('/users', function (req, res) {
  db.User.createSecure( req.body.user,
    function (err, newUser) {
      if (err) {
        res.render('welcome.ejs',
          { view: 'signup', data: { signupAlert: err.errmsg }, status: 'error' });
        // validation(s) failed; add a flash mesg here
        // res.redirect('/signup');
      }
      req.login(newUser);
      console.log('Logged in user: ', newUser.email);
      console.log('req.session: ', req.session);
      res.redirect('/users/' + newUser._id);
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

app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port 3000...");
});
