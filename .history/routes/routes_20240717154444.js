const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/admin');
const Category = require('../models/category');
const Food = require('../models/food');
const Orders = require('../models/order');
const isAuthenticated = require('../middleware/isAuthenticated');
const order = require('../models/order');
const food = require('../models/food');


// Middleware to redirect to login if not authenticated
const redirectToLogin = (req, res, next) => {
    if (!req.session.adminId) {
        return res.redirect('/login');
    }
    next();
};

// Middleware to set the admin variable
router.use((req, res, next) => {
    res.locals.admin = req.session.admin;
    next();
});

// Middleware to set the category variable
router.use((req, res, next) => {
    res.locals.category = req.session.category;
    next();
});


// Middleware to set the food variable
router.use((req, res, next) => {
    res.locals.food = req.session.food;
    next();
});

// Middleware to set the order variable
router.use((req, res, next) => {
    res.locals.order = req.session.order;
    next();
});


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

        console.log('Admin found:', admin);

        if (!admin) {
            console.log('Admin not found');
            return res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        console.log('Password valid:', isPasswordValid);

        if (isPasswordValid) {
            req.session.adminId = admin._id;
            res.redirect('/');
        } else {
            res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
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

// Manage Admin route.
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
        console.error('Error fetching admins:', err);
        res.status(500).send({ message: err.message });
    }
});


// Dashboard route or Home route
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        // You may need to fetch other data or perform operations specific to this route
        res.render('index', { title: 'Darshboard', admin: admin });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Manage-order route
router.get('/order', isAuthenticated, async (req, res) => {
    try {
        const allOrders = await Orders.find();
        const loggedInOrders = await Orders.findById(req.session.orderID);
        
        // Fetch admin data for welcome user massage.
        const admin = await Admin.findById(req.session.adminID);
        const loggedInAdmin = await Admin.findById(req.session.adminId);

        // Ensure allCategory is properly handled if no categories found
        if (!allOrders) {
            return res.status(404).send({ message: "No Orders found." });
        }

        // Render the page with necessary variables
        res.render('manage-order', {
            title: 'Manage Order Page',
            allOrders: allOrders,
            loggedInOrders: loggedInOrders,
            order: loggedInOrders,
            admin: loggedInAdmin, // Pass admin data to the template
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Manage-food route
router.get('/food', isAuthenticated, async (req, res) => {
    try {
        const allFoods = await Food.find();
        const loggedInFood = await Food.findById(req.session.foodID);
        
        // Fetch admin data for welcome user massage.
        const admin = await Admin.findById(req.session.adminID);
        const loggedInAdmin = await Admin.findById(req.session.adminId);

        // Ensure allFoods is properly handled if no foods found
        if (!allFoods) {
            return res.status(404).send({ message: "No food found." });
        }

        // Render the page with necessary variables
        res.render('manage-food', {
            title: 'Manage Foods Page',
            allFoods: allFoods,
            loggedInFood: loggedInFood,
            foods: loggedInFood,
            admin: loggedInAdmin, // Pass admin data to the template
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Add admin form route
router.get('/add_admin', (req, res) => {
    res.render('add_admin', { title: 'Add New Admin' });
});

// Add category form route
router.get('/add_category', (req, res) => {
    res.render('add_category', { title: 'Add New Category' });
});

// Add food form route
router.get('/add_food', (req, res) => {
    res.render('add_food', { title: 'Add New Foods' });
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

// Manage-category route
router.get('/category', isAuthenticated, async (req, res) => {
    try {
        const allCategory = await Category.find();
        const loggedInCategory = await Category.findById(req.session.categoryID);
        
        // Fetch admin data for welcome user massage.
        const admin = await Admin.findById(req.session.adminID);
        const loggedInAdmin = await Admin.findById(req.session.adminId);

        // Ensure allCategory is properly handled if no categories found
        if (!allCategory) {
            return res.status(404).send({ message: "No category found." });
        }

        // Render the page with necessary variables
        res.render('manage-category', {
            title: 'Manage Category Page',
            allCategory: allCategory,
            loggedInCategory: loggedInCategory,
            category: loggedInCategory,
            admin: loggedInAdmin, // Pass admin data to the template
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Add category route
router.post('/add-category', upload.single('image'), async (req, res) => {
    try {
        const { body, file } = req;

        // Check if title is empty
        if (!body.title) {
            return res.status(400).send({ message: "Title is required." });
        }

        // Check if image is uploaded
        if (!file) {
            return res.status(400).send({ message: "Image is required." });
        }

        // Check if featured and active fields are selected
        if (!body.featured || !body.active) {
            return res.status(400).send({ message: "Please select featured and active options." });
        }

        // Create a new category
        const newCategory = new Category({
            title: body.title,
            image: file.filename, // Store only the filename
            featured: body.featured,
            active: body.active,
        });

        // Save the category
        await newCategory.save();

        // Redirect to the manage-category page with success message
        res.redirect('/category?success=Category added successfully!');
    } catch (err) {
        console.error('Error adding category:', err);
        res.status(500).send({ message: 'Failed to add category.' });
    }
});

// Get all food route
router.get("/food", async (req, res) => {
    try {
        const admin = await food.find();
        res.render('manage-food', {
            title: 'Manage Foods Page',
            admin: admin,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Get all order route
router.get("/order", async (req, res) => {
    try {
        const admin = await order.find();
        res.render('manage-order', {
            title: 'Manage Order Page',
            admin: admin,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;