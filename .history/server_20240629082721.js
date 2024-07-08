// import
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const PORT = process.env.PORT || 8000

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Database connection
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to the database!'));

// moddlewares
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(
  session({
  secret: 'my secret key',
  saveUninitialized: true,
  resave: false,
  })
)

app.use((request, response, next) =>{
  response.locals.message = request.session.message
  delete request.session.message
  next()
})

//set template engine
app.set('view engine', 'ejs')

// route prefix
app.use('', require('./routes/routes'))

app.get('/', (request, response)=>{
  response.sendFile(__dirname + '/public/index.html')
})

app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on https://localhost:${PORT}! Go get it..........`)
})