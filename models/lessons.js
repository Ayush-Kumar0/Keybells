const mongoose = require('mongoose');

const lessonsSchema = new mongoose.Schema({
    paragraph: {
        type: String,
        required: true,
        unique: true
    },
    paraType: {
        type: String,
        required: true,
    },
    speed: {
        type: Number,
        required: true
    }
});



const Lesson = mongoose.model('lessons', lessonsSchema);
module.exports = Lesson;