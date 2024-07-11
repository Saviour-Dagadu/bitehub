const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/admin');
const isAuthenticated = require('../middleware/isAuthenticated');
const Category = require('../models/category');


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
        cb(null, `Food_category_${Date.now()}${path.extname(file.originalname)}`);
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

// Example for manage-category route
router.get('/category', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        // You may need to fetch other data or perform operations specific to this route
        res.render('manage-category', { title: 'Manage Categories', admin: admin });
    } catch (err) {
        res.status(500).send({ message: err.message });
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

// Route to render the manage categories page
router.get('/manage-category', async (req, res) => {
    try {
        const allCategories = await Category.find();
        res.render('manage-category', {
            title: 'Manage Categories',
            allCategories,
            successMessage: req.session.successMessage,
            errorMessage: req.session.errorMessage
        });

        // Clear messages after rendering
        req.session.successMessage = null;
        req.session.errorMessage = null;
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Failed to fetch categories.';
        res.redirect('/manage-category');
    }
});

// Route to delete a category
router.get('/delete-category/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (category.image_name) {
            const fs = require('fs');
            const imagePath = `public/uploads/${category.image_name}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Category.findByIdAndDelete(id);
        req.session.successMessage = 'Category deleted successfully.';
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Failed to delete category.';
    } finally {
        res.redirect('/manage-category');
    }
});

// Route to update a category (Add your update logic here)
// Example:
// router.post('/update-category/:id', async (req, res) => {
//     // Update logic here
// });


// Route to render the Add Category page
router.get('/add-category', (req, res) => {
    res.render('add-category', {
        title: 'Add Category',
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage
    });
});

// Route to handle the Add Category form submission
router.post('/add-category', upload.single('image'), async (req, res) => {
    try {
        const { title, featured, active } = req.body;
        let imageName = '';

        if (req.file) {
            imageName = req.file.filename;
        }

        const newCategory = new Category({
            title,
            image_name: imageName,
            featured: featured || 'No',
            active: active || 'No'
        });

        await newCategory.save();
        
        req.session.successMessage = 'Category Added Successfully.';
        res.redirect('/manage-category');
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Failed to Add Category.';
        res.redirect('/add-category');
    }
});

// Route to render the update category page
router.get('/update-category/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            req.session.errorMessage = 'Category not found.';
            return res.redirect('/manage-category');
        }
        res.render('update-category', {
            title: 'Update Category',
            category
        });
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Failed to fetch category details.';
        res.redirect('/manage-category');
    }
});

// Route to handle category update
router.post('/update-category/:id', async (req, res) => {
    const { title, featured, active } = req.body;
    const { id } = req.params;
    let image_name = "";

    try {
        const category = await Category.findById(id);
        if (!category) {
            req.session.errorMessage = 'Category not found.';
            return res.redirect('/manage-category');
        }

        if (req.files && req.files.image) {
            const image = req.files.image;
            const ext = image.name.split('.').pop();
            image_name = `Food_category_${Date.now()}.${ext}`;
            const uploadPath = `public/uploads/${image_name}`;

            await image.mv(uploadPath);

            // Delete old image if a new one is uploaded
            if (category.image_name) {
                const fs = require('fs');
                const oldImagePath = `public/uploads/${category.image_name}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } else {
            image_name = category.image_name;
        }

        category.title = title;
        category.featured = featured;
        category.active = active;
        category.image_name = image_name;

        await category.save();
        req.session.successMessage = 'Category updated successfully.';
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Failed to update category.';
    } finally {
        res.redirect('/manage-category');
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