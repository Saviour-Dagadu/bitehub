const express = require('express')
const router = express.Router()
const User = require('../modules/users')
const multer = require('multer')

// image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})

var upload = multer({
    storage: storage,
}).single("image")

// Insert an admin into database route
route.post('/add_admin', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    })
    user.save((err) => {
        if(err){
            res.json({message: err.message, type: 'danger'})
        } else {
            req.session.message = {
                type: 'success',
                message: 'Admin added successfully'
            }
            res.redirect('/')
        }
    })
})

router.get('/dashboard', (request, response) => {
    response.render('index', { title : 'Dashboard' })
})

router.get('/admin', (request, response) => {
    response.render('manage-admin', { title: 'Manage Admin' })
})

router.get('/category', (request, response) => {
    response.render('manage-category', { title: 'Manage Categories' })
})

router.get('/food', (request, response) => {
    response.render('manage-food', { title: 'Manage Foods' })
})

router.get('/order', (request, response) => {
    response.render('manage-order', { title: 'Manage Orders' })
})

router.get('/add_admin', (request, response) => {
    response.render('add_admin', { title: 'Add New Admin' })
})

module.exports = router;