const express = require('express')
const app = express()
const PORT = 8000

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (request, response) => {
    response.sendFile(__dirname + './public/index.html')
})


app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}! Go get it..........`)
})