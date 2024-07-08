const express = require('express')
const app = express()
const path = require('path');
const PORT = 8000

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use(express.static('public', {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['css', 'jpg'],
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      console.log(`Serving file: ${path}`);
    }
  }));

app.get('/', (request, response) => {
    const indexPath = path.join(__dirname, '../public/index.html'); // adjust the path accordingly
    response.sendFile(indexPath);
  })


app.get('/api', (request, response) => {
    response.json()
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}! Go get it..........`)
})