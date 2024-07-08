const express = require('express')
const router = express.Router()

router.get('/users', (request, response) => {
    response.render('index', { title : 'Dashboard' })
})

router.get('/admin', (request, response) => {
    response.render('manage-admin', { title: 'Manage Admin' })
})

module.exports = router;