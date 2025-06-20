const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const apiRouter = require('./routes/api');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

// session
const session = require('express-session');
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRouter);



// Export the app instead of listening here
module.exports = app;