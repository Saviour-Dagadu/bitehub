const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image_name: {
        type: String,
        required: false
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    featured: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    active: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes'
    }
});

module.exports = mongoose.model('Food', foodSchema);
