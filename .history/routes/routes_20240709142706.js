const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const Admin = require('../model/admin');
const isAuthenticated = require('../middleware/isAuthenticated');

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

        if (!body.password) {
            return res.status(400).send({ message: "Password is required." });
        }
        if (!file) {
            return res.status(400).send({ message: "Image is required." });
        }

        const existingAdmin = await Admin.findOne({ email: body.email });
        if (existingAdmin) {
            return res.status(400).send({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const newAdmin = new Admin({
            name: body.name,
            email: body.email,
            username: body.username,
            password: hashedPassword,
            phone: body.phone,
            image: file.filename, // Store only the filename
        });

        await newAdmin.save();

        res.redirect('/admin?success=Admin added successfully!');

    } catch (err) {
        console.error('Error adding admin:', err);
        res.status(500).send({ message: 'Failed to add admin.' });
    }
});


/// Get all admin route
router.get("/admin", async (req, res) => {
    try {
        const admin = await Admin.find();
        res.render('manage-admin', {
            title: 'Manage Admin Page',
            admin: admin,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    res.render('index', { title: 'Dashboard' });
});

// Category management route
router.get('/category', (req, res) => {
    res.render('manage-category', { title: 'Manage Categories' });
});

// Food management route
router.get('/food', (req, res) => {
    res.render('manage-food', { title: 'Manage Foods' });
});

// Order management route
router.get('/order', (req, res) => {
    res.render('manage-order', { title: 'Manage Orders' });
});

// Add admin form route
router.get('/add_admin', (req, res) => {
    res.render('add_admin', { title: 'Add New Admin' });
});

// Edit an Admin route
router.get('/edit/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (admin) {
            res.render('edit_admin', {
                title: 'Edit Admin',
                admin: admin,
            });
        } else {
            res.redirect('/admin');
        }
    } catch (err) {
        console.error('Error editing admin:', err);
        res.redirect('/admin');
    }
});

// Route to handle updating an admin
router.post('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { body, file, params } = req;

        // Find the admin by ID
        const admin = await Admin.findById(params.id);
        if (!admin) {
            return res.redirect('/');
        }

        // Update admin fields
        admin.name = body.name;
        admin.username = body.username;
        admin.email = body.email;
        admin.phone = body.phone;
        if (body.password) {
            admin.password = await bcrypt.hash(body.password, 10);
        }

        // Update image only if a new one is uploaded, otherwise keep the old image
        if (file) {
            admin.image = file.filename;
        } else {
            admin.image = body.old_image;
        }

        // Save updated admin
        await admin.save();

        // Redirect to the manage-admin page with success message
        res.redirect('/admin?success=Admin updated successfully!');
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Route to handle deleting an admin
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const admin = await Admin.findByIdAndDelete(id);

        if (!admin) {
            return res.redirect('/admin?error=Admin not found!');
        }

        // Check if the admin has an image and delete it
        if (admin.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', admin.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Image deleted successfully.');
            } else {
                console.log('Image not found:', imagePath);
            }
        }

        res.redirect('/admin?success=Admin deleted successfully!');
    } catch (err) {
        console.error('Error deleting admin:', err);
        res.redirect('/admin?error=Failed to delete admin!');
    }
});

// Route to render login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', message: null });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        console.log('Admin found:', admin);

        if (!admin) {
            console.log('Admin not found');
            return res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        console.log('Password valid:', isPasswordValid);

        if (isPasswordValid) {
            req.session.adminId = admin._id;
            res.redirect('/dashboard');
        } else {
            res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.render('login', { title: 'Login', message: 'An error occurred during login. Please try again.' });
    }
});

// Protect routes that require authentication
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('index', { title: 'Dashboard' });
});

router.get('/admin', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.find();
        res.render('manage-admin', {
            title: 'Manage Admin Page',
            admin: admin,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;