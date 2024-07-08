// import
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const PORT = process.env.PORT 

// Serve static files from the 'public' directory
app.use(express.static('public'))


app.get('/', (request, response)=>{
  response.sendFile(__dirname + '/public/index.html')
})

app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on https://localhost:${PORT}! Go get it..........`)
})