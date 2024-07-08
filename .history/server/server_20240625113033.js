const express = require('express')
const app = express()
const path = require('path');
const PORT = 8000

// app.get('/', (request, response) => {
//     response.sendFile(__dirname + '/index.html')
// })

app.get('/', (req, res) => {
    const htmlFile = path.join(__dirname, 'public', 'index.html'); // Absolute path to index.html
    res.sendFile(htmlFile);
  });

app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}! Go get it..........`)
})