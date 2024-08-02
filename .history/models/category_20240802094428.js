const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true // Remove leading and trailing whitespace
    },
    image: {
        type: String,
        required: true // Make image a required field
    },
    featured: {
        type: String,
        enum: ['Yes', 'No'], // Restrict values to 'Yes' or 'No'
        default: 'No' // Set default value to 'No'
    },
    active: {
        type: String,
        enum: ['Yes', 'No'], // Restrict values to 'Yes' or 'No'
        default: 'Yes' // Set default value to 'Yes'
    }
});

module.exports = mongoose.model('Category', CategorySchema);
