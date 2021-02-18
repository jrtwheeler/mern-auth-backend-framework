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

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`App listening on {port}`))