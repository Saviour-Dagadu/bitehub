// routes/routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const Admin = require('../model/admin'); // Ensure correct path

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
      password: hashedPassword,
      phone: body.phone,
      image: file.path,
    });

    await newAdmin.save();

    res.redirect('/admin?success=Admin added successfully');

  } catch (err) {
    res.status(500).send(err);
  }
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
    res.json({ message: err.message });
  }
});

router.get('/dashboard', (req, res) => {
  res.render('index', { title: 'Dashboard' });
});

router.get('/category', (req, res) => {
  res.render('manage-category', { title: 'Manage Categories' });
});

router.get('/food', (req, res) => {
  res.render('manage-food', { title: 'Manage Foods' });
});

router.get('/order', (req, res) => {
  res.render('manage-order', { title: 'Manage Orders' });
});

router.get('/add_admin', (req, res) => {
  res.render('add_admin', { title: 'Add New Admin' });
});

module.exports = router;
