const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const Admin = require('../model/admin'); 

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

        // Validate required fields
        if (!body.password) {
            return res.status(400).send({ message: "Password is required." });
        }
        if (!file) {
            return res.status(400).send({ message: "Image is required." });
        }

        // Check if an admin with the same email already exists
        const existingAdmin = await Admin.findOne({ email: body.email });
        if (existingAdmin) {
            return res.status(400).send({ message: "Email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Create a new admin with the provided data
        const newAdmin = new Admin({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phone: body.phone,
            image: file.path,
        });

        // Save the new admin to the database
        const admin = await newAdmin.save();

        // Redirect to the manage-admin page with success message
        res.redirect('/manage-admin?success=Admin added successfully');

    } catch (err) {
        res.status(500).send(err);
    }
});

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