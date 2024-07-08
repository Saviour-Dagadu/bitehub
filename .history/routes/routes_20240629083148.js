const express = require('express')
const router = express.Router()

router.get('/users', (request, response) => {
    response.send('All Users')
})

module.exports = router;