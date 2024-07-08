// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const routes = require('./routes/routes');
require('dotenv').config({ path: './config/.env' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.static('uploads'));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
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

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to the database!'));

// Use routes defined in routes.js
app.use('/', routes); 

app.listen(PORT, () => {
  console.log(`The server is running on https://localhost:${PORT}!`);
});
