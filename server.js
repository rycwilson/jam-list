var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    flash = require('express-flash'),
    ejs = require('ejs'),
    path = require('path'),
    views = path.join(__dirname, 'views'),
    env = require('dotenv').load(),
    api = require('genius-api'),
    genius = new api(process.env.GENIUS_ACCESS_TOKEN),
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
  genius.search('Rush').then(function (response) {
    console.log('hits', response.hits);
  });
  genius.song(143142).then(function (response) {
    console.log('song', response.song);
  });
  res.render('welcome.ejs', { view: 'login', data: null, status: null });
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

app.get('/songs', function (req, res) {
  db.Song.find({}, function (err, songs) {
    if (err) { console.log(err); }
    res.send(songs);
  });
});

app.post('/songs', function (req, res) {
  db.Song.create(req.body.song, function (err, song) {
    if (err) { return console.log(err); }
    res.send(song);
  });
});

app.delete('/songs/:id', function (req, res) {
  db.Song.findByIdAndRemove(req.params.id, { select: '_id' },
    function (err, song) {
      if (err) {
        res.status(500).send(err);
      }
      console.log('here is the song being removed: ', song);
      // JSON response:
      res.status(200).send(song);
      // HTML response:
      // res.redirect('/');
    }
  );
});

app.get('/genius-search', function (req, res) {
  genius.search(req.query.title)
    .then(function (response) {
      if (response.hits.length) {
        // print the hits to console
        response.hits.forEach(function (hit, index) {
          console.log(index, hit.result.title, hit.result.primary_artist.name);
        });
        // search the hits for title and artist match
        matches = response.hits.filter(function (hit) {
          return (hit.result.title.toLowerCase() === req.query.title.toLowerCase()
            && hit.result.primary_artist.name.toLowerCase() === req.query.artist.toLowerCase());
        });
        // anything found?
        if (matches.length) {
          song = matches[0].result;
          // respond with the genius data for the song
          res.json({ id: song.id, title: song.title,
                    url: song.url, artist: song.primary_artist.name });
        }
        else {
          res.json({ error: 'Not found' });
        }
      }
      else {  // no hits
        res.json({ error: 'Not found' });
      }
    });
});

app.get('/lyrics/:geniusId', function (req, res) {
  var geniusId = parseInt(req.params.geniusId, 10);
  if (geniusId) {
    res.render('lyrics.ejs', { id: geniusId });
  }
  else {
    res.sendFile(path.join(views, 'lyrics-placeholder.html'));
  }
});

/*
  this route handles ajax login requests, responds with the logged in
  user or appropriate error code/message
*/
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

app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port 3000...");
});
