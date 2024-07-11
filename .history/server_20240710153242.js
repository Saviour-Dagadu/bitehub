const express = require('express');
const app = express();
const routes = require('./routes/routes');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const PORT = process.env.PORT || 8000;

// Use .env file in config folder
require('dotenv').config({ path: './config/.env' });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to the database!'));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.successMessage = req.session.successMessage;
  res.locals.errorMessage = req.session.errorMessage;
  delete req.session.successMessage;
  delete req.session.errorMessage;
  next();
});


// Session configuration
app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);


// Set local variables for response
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Set view engine
app.set('view engine', 'ejs');

// Use routes defined in routes.js
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`The server is running on https://localhost:${PORT}!`);
});
