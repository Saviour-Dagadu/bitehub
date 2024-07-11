const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image_name: {
        type: String,
        required: false
    },
    featured: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    active: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    }
});

module.exports = mongoose.model('Category', CategorySchema);
