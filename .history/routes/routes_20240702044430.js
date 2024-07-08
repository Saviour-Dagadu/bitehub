const express = require('express')
const router = express.Router()

router.get('/users', (request, response) => {
    response.render('index', { Restaurant_Website : 'BiteHub' })
})

router.get('/admin', (req, res) => {
    res.render('manage_admin', { title: 'Manage Admin'})
})

module.exports = router;