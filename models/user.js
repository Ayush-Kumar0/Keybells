const mongoose = require('mongoose');
const crypto = require('crypto');
const randomSchema = require('./randomSchema');
const myParasSchema = require('./myParasSchema');

const challengeSchema = new mongoose.Schema({
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'challenges'
    },
    grossSpeed: {
        type: Number
    },
    netSpeed: {
        type: Number
    },
    accuracy: {
        type: Number
    }
});

const lessonSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lessons',
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
    }
});

const userSchema = new mongoose.Schema({
    //Login fields
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    lastTenSpeeds: {
        type: Array,
        required: true
    },
    //Other fields
    rank: {
        type: Number
    },
    league: {
        type: String
    },
    //Lessons
    lessons: {
        type: [lessonSchema]
    },
    unlockedLessons: {
        type: Number
    },
    avgLessonWPM: {
        type: Number,
        required: true
    },
    netLessonScore: {
        type: Number,
        required: true
    },
    lessonStars: {
        type: Number,
        required: true
    },
    //Challenges
    challenges: {
        type: [challengeSchema]
    },
    // Random Paragraphs
    random: {
        type: [randomSchema]
    },
    avgRandomWPM: {
        type: Number,
        required: true
    },
    netRandomScore: {
        type: Number,
        required: true
    },
    randomStars: {
        type: Number,
        required: true
    },
    // My Paragraphs
    myParas: {
        type: [myParasSchema],
        sparse: true
    },
    avgMyParasWPM: {
        type: Number,
        required: true
    },
    netMyParasScore: {
        type: Number,
        required: true
    },
    myParasStars: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

userSchema.methods.setPassword = function (password) {
    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(20).toString('hex');

    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    this.password = crypto.pbkdf2Sync(password.toString('hex'), this.salt, 1000, 64, `sha512`).toString(`hex`);
};

userSchema.methods.checkPassword = function (pass) {
    password = crypto.pbkdf2Sync(pass.toString('hex'), (this.salt).toString('hex'), 1000, 64, `sha512`).toString(`hex`);
    return this.password == password;
};

userSchema.methods.setUsername = function (email) {
    this.username = email.substring(0, email.indexOf('@'));
}


const User = mongoose.model('users', userSchema);
module.exports = User;