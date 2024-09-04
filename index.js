// index.js

const express = require("express");
const app = express();
const mongoose = require('mongoose')
const session = require("express-session");
const passport = require("passport");
const path = require('path');

const FacebookStrategy = require('passport-facebook').Strategy;
const protectedRouter = require('./src/controller/protected-route');

const facebookRouter = require('./src/controller/facebook-auth');
// const protectedRouter = require('./src/controllers/protected-route');
// const passport = require('passport');

// const FacebookStrategy = require('passport-facebook').Strategy;
app.set('view engine', 'ejs');

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
require('dotenv').config();

const connectToMongoDb = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDb..'))
    .catch((error) => {
      console.log('Error in connecting to mongoDB ' + error);
      throw error;
    });
};
connectToMongoDb();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
console.log(process.env.PORT)
const port = process.env.PORT;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


app.get('/', (req, res) => {
  res.render('auth');
});

app.use('/auth/facebook', facebookRouter);
app.use('/protected', protectedRouter);


app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
