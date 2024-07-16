const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image_name: {
        type: String
    },
    description: {
        type: String
    },
    price: {
        type: Float32Array
    }
});

module.exports = mongoose.model('Food', FoodSchema);
