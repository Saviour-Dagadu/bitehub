const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image_name: {
        type: String
    },
    featured: {
        type: String
    },
    active: {
        type: String
    }
});

module.exports = mongoose.model('Category', CategorySchema);
