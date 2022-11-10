const mongoose = require('mongoose');
const crypto = require('crypto');

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
        unique: true
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

const userSchema = new mongoose.Schema({
    //Login fields
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
        type: String
    },
    name: {
        type: String,
        require: true
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
    //Challenges
    challenges: {
        type: [challengeSchema]
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


const User = mongoose.model('users', userSchema);
module.exports = User;