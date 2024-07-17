const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
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
        type: Number
    }
});

module.exports = mongoose.model('Orders', OrdersSchema);
