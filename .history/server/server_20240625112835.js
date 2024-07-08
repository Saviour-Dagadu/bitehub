const express = require('express')
const app = express()
const PORT = 8000

// app.get('/', (request, response) => {
//     response.sendFile(__dirname + '/index.html')
// })

app.use(express.static('public')); // Serve files from the 'public' directory

app.get('/', (req, res) => {
  res.sendFile('index.html'); // Serve the HTML file
});

app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}! Go get it..........`)
})