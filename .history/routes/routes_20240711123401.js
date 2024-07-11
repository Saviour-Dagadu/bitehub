const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/admin');
const Category = require('../models/category'); // Assuming you have a Category model
const isAuthenticated = require('../middleware/isAuthenticated');

// Middleware to redirect to login if not authenticated
const redirectToLogin = (req, res, next) => {
    if (!req.session.adminId) {
        return res.redirect('/login');
    }
    next();
};

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

// Route to render login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', message: null, admin: req.session.admin });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (isPasswordValid) {
            req.session.adminId = admin._id;
            res.redirect('/');
        } else {
            res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }
    } catch (error) {
        res.render('login', { title: 'Login', message: 'An error occurred during login. Please try again.' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to logout' });
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});

// Protect routes that require authentication
router.use(redirectToLogin);

// Dashboard route or Home route
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        res.render('index', { title: 'Dashboard', admin: admin });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Manage Admin route
router.get('/admin', isAuthenticated, async (req, res) => {
    try {
        const allAdmins = await Admin.find();
        const loggedInAdmin = await Admin.findById(req.session.adminId);

        if (!allAdmins) {
            return res.status(404).send({ message: "No admins found." });
        }

        res.render('manage-admin', {
            title: 'Manage Admin Page',
            allAdmins: allAdmins,
            loggedInAdmin: loggedInAdmin,
            admin: loggedInAdmin, // Pass loggedInAdmin to ensure it's defined in the header.ejs template
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Example for manage-category route
router.get('/category', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        const categories = await Category.find(); // Fetch all categories

        res.render('manage-category', { 
            title: 'Manage Categories', 
            admin: admin,
            categories: categories // Pass categories to the template
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Add category form route
router.get('/add_category', isAuthenticated, (req, res) => {
    res.render('add_category', { title: 'Add New Category' });
});

// Route to handle adding a category
router.post('/add_category', upload.single('image'), async (req, res) => {
    try {
        const { body, file } = req;

        if (!file) {
            return res.status(400).send({ message: "Image is required." });
        }

        const newCategory = new Category({
            title: body.title,
            image: file.filename, // Store only the filename
            featured: body.featured,
            active: body.active,
        });

        await newCategory.save();

        res.redirect('/category?success=Category added successfully!');
    } catch (err) {
        console.error('Error adding category:', err);
        res.status(500).send({ message: 'Failed to add category.' });
    }
});

// Edit category route
router.get('/edit_category/:id', isAuthenticated, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.render('edit_category', {
                title: 'Edit Category',
                category: category,
            });
        } else {
            res.redirect('/category');
        }
    } catch (err) {
        console.error('Error editing category:', err);
        res.redirect('/category');
    }
});

// Route to handle updating a category
router.post('/update_category/:id', upload.single('image'), async (req, res) => {
    try {
        const { body, file, params } = req;

        // Find the category by ID
        const category = await Category.findById(params.id);
        if (!category) {
            return res.redirect('/add_category');
        }

        // Update category fields
        category.title = body.title;
        category.featured = body.featured;
        category.active = body.active;

        // Update image only if a new one is uploaded, otherwise keep the old image
        if (file) {
            category.image = file.filename;
        } else {
            category.image = body.old_image;
        }

        // Save updated category
        await category.save();

        // Redirect to the manage-category page with success message
        res.redirect('/category?success=Category updated successfully!');
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Route to handle deleting a category
router.get('/delete_category/:id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.redirect('/category?error=Category not found!');
        }

        // Check if the category has an image and delete it
        if (category.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Image deleted successfully.');
            } else {
                console.log('Image not found:', imagePath);
            }
        }

        res.redirect('/category?success=Category deleted successfully!');
    } catch (err) {
        console.error('Error deleting category:', err);
        res.redirect('/category?error=Failed to delete category!');
    }
});

// Example for manage-order route
router.get('/order', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        // You may need to fetch other data or perform operations specific to this route
        res.render('manage-order', { title: 'Manage Orders', admin: admin });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Example for manage-food route
router.get('/food', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        // You may need to fetch other data or perform operations specific to this route
        res.render('manage-food', { title: 'Manage Foods', admin: admin });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Add admin form route
router.get('/add_admin', (req, res) => {
    res.render('add_admin', { title: 'Add New Admin' });
});

// Get all admin route
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
            return res.redirect('/add_admin');
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

module.exports = router;