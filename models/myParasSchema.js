const mongoose = require('mongoose');

const myParasSchema = new mongoose.Schema({
    paragraph: {
        type: String
    },
    paraType: {
        type: String,
    },
    time: {
        type: Date,
    },
    grossSpeed: {
        type: Number
    },
    netSpeed: {
        type: Number
    },
    accuracy: {
        type: Number
    },
    stars: {
        type: Number
    },
    score: {
        type: Number
    }
});


module.exports = myParasSchema;