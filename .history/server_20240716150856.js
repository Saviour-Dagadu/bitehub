const express = require('express');
const app = express();
const routes = require('./routes/routes'); // Ensure this path is correct
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
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
    cookie: { secure: false } // Set to true if using HTTPS
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
