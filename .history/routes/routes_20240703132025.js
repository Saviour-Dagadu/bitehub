const express = require('express')
const router = express.Router()
const Admin = require('../modules/admin')
const multer = require('multer')

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route to handle adding an admin
router.post('/add_admin', upload.single('image'), async (req, res) => {
    try {
        const { body, file } = req;

        if (!file) {
            return res.status(400).send({ message: "Image is required." });
        }

        // Create a new admin with the image path
        const newAdmin = new Admin({
            ...body,
            image: file.path
        });

        const admin = await newAdmin.save();
        res.status(200).send(admin);
    } catch (err) {
        res.status(500).send(err);
    }
});

// router.post('/add_admin', upload, (req, res) => {
//     const user = new User({
//         name: req.body.name,
//         user_name: req.body.user_name,
//         email: req.body.email,
//         phone: req.body.phone,
//         image: req.file.filename,
//     })
//     user.save((err) => {
//         if(err){
//             res.json({message: err.message, type: 'danger'})
//         } else {
//             req.session.message = {
//                 type: 'success',
//                 message: 'Admin added successfully'
//             }
//             res.redirect('/admin')
//         }
//     })
// })

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