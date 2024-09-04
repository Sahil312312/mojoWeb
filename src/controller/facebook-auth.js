const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../models/usermodels');
const router = express.Router();
require('dotenv').config();

// Initialize Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_SECRET_KEY,
      callbackURL: "http://localhost:8000/auth/facebook/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await User.findOne({
          accountId: profile.id,
          provider: 'facebook',
        });
        
        if (!user) {
          console.log('Adding new Facebook user to DB..');
          user = new User({
            accountId: profile.id,
            name: profile.displayName,
            provider: profile.provider,
          });
          await user.save();
        } else {
          console.log('Facebook User already exists in DB..');
        }
        
        return cb(null, profile);
      } catch (error) {
        console.error('Error in Facebook authentication:', error);
        return cb(error);
      }
    }
  )
);

// Route to initiate Facebook authentication
router.get('/', (req, res, next) => {
  passport.authenticate('facebook', { scope: 'email' })(req, res, next);
});

// Facebook authentication callback route
router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/success');
  }
);

// Success route
router.get('/success', (req, res) => {
  if (req.isAuthenticated()) {
    const userInfo = {
      id: req.session.passport.user.id,
      displayName: req.session.passport.user.displayName,
      provider: req.session.passport.user.provider,
    };
    res.render('fb-github-success', { user: userInfo });
  } else {
    res.redirect('/auth/facebook/error');
  }
});

// Error route
router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));

// Signout route
router.get('/signout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send({ message: 'Failed to sign out user' });
      } else {
        console.log('Session destroyed.');
        res.redirect('/');
      }
    });
  } catch (err) {
    console.error('Error in signout route:', err);
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('An error occurred:', err);
  res.status(500).send('Internal Server Error');
});

module.exports = router;
