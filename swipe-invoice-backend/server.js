const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20'); // Correct import
const session = require('cookie-session');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables

const app = express();

// Use cookie session to store user session data
app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET], // Make sure SESSION_SECRET is defined in your .env file
  maxAge: 24 * 60 * 60 * 1000, // 1 day
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3001/auth/google/callback',
}, (token, tokenSecret, profile, done) => {
  // You can store profile in DB or in session here
  return done(null, profile); // You can store the user profile or its ID for later use
}));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);  // Store user data in session
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);  // Retrieve user data from session
});

// Routes for Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
}), (req, res) => {
  // Redirect user to the dashboard or home page after successful login
  res.redirect('/dashboard');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  // If user is authenticated, show their profile or data
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.displayName}!`);
  } else {
    res.redirect('/');
  }
});

// Logout route to clear session
app.get('/logout', (req, res) => {
  req.logout(() => {});
  res.redirect('/');
});

// Starting the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
