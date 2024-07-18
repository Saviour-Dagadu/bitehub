const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: String
    },
    active: {
        type: String
    }
});

module.exports = mongoose.model('Category', CategorySchema);
