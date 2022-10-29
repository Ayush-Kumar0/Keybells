const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});

userSchema.methods.setPassword = function (password) {
    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(20).toString('hex');

    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    this.password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
};

userSchema.methods.checkPassword = function (password) {
    password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.password === password;
};


const User = mongoose.model('users', userSchema);

module.exports = User;