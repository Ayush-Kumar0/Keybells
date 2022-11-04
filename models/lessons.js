const mongoose = require('mongoose');

const lessonsSchema = new mongoose.Schema({
    paraType: {
        type: String,
        required: true,
        unique: true
    },
    paragraph: {
        type: String,
        required: true,
        unique: true
    },
    level: {
        type: Number
    }
});



const Lesson = mongoose.model('lessons', lessonsSchema);
module.exports = Lesson;