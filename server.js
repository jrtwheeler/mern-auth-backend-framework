// First, we require Express and create our Express app by calling express().
// Then we define the directory from which to serve our static files.
const express = require("express");
const app = express();

// The next line sees us require the body-parser middleware, which will help us 
// parse the body of our requests. We’re also adding the express-session middleware 
// to help us save the session cookie.
app.use(express.static(__dirname));

const bodyParser = require("body-parser");
const expressSession = require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitalized: false
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

// Passport Setup
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

//Mongoose
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/MyDatabase',
  { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/* PASSPORT LOCAL AUTHENTICATION */

// passport use the local strategy by calling createStrategy() 
//on our UserDetails model — courtesy of passport-local-mongoose
passport.use(UserDetails.createStrategy());

//invoked on authentication, and its job is to serialize the user instance 
//with the information we pass on to it and store it in the session via a cookie
passport.serializeUser(UserDetails.serializeUser());
//invoked every subsequent request to deserialize the instance, 
//providing it the unique cookie identifier as a “credential”.
passport.deserializeUser(UserDetails.deserializeUser());

/* ROUTES */

const connectEnsureLogin = require('connect-ensure-login');

app.post('/login', (req, res, next) => {
  passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login?info=' + info);
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });

  })(req, res, next);
});

app.get('/login',
  (req, res) => res.sendFile('html/login.html',
  { root: __dirname })
);

app.get('/',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/index.html', {root: __dirname})
);

app.get('/private',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/private.html', {root: __dirname})
);

app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`App listening on {port}`))