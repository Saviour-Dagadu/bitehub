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
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Protect routes that require authentication
router.use(redirectToLogin);

// Manage-category route
router.get('/category', isAuthenticated, async (req, res) => {
    try {
        const allCategory = await Category.find();
        const loggedInCategory = await Category.findById(req.session.categoryID);
        
        // Fetch admin data for welcome user message.
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

// Edit Category route
router.get('/edit_category/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id); // Corrected import
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

// Route to handle updating category
router.post('/update_category/:id', upload.single('image'), async (req, res) => {
    try {
        const { body, file, params } = req;

        // Find the category by ID
        const category = await Category.findById(params.id); // Corrected import
        if (!category) {
            return res.redirect('/add_category');
        }

        // Update admin fields
        category.title = body.title;
        category.featured = body.featured;
        category.active = body.active;

        // Update image only if a new one is uploaded, otherwise keep the old image
        if (file) {
            category.image = file.filename;
        } else {
            category.image = body.old_image;
        }

        // Save updated admin
        await category.save();

        // Redirect to the manage-admin page with success message
        res.redirect('/category?success=Category updated successfully!');
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// Route to handle deleting a category
router.get('/delete_category/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findByIdAndDelete(id); // Corrected import

        if (!category) {
            return res.redirect('/category?error=Category not found!');
        }

        // Check if the admin has an image and delete it
        if (category.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
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

module.exports = router;
