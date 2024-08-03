const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image_name: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Food', foodSchema);
