const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    grossSpeed: {
        type: Number
    },
    netSpeed: {
        type: Number
    }
});

const challengesSchema = new mongoose.Schema({
    paragraph: {
        type: String,
        required: true,
        unique: true
    },
    //Name of the challenge
    name: {
        type: String,
        require: true,
        unique: true
    },

    //Other fields related to users
    users: {
        type: [usersSchema]
    }
});



const Challenge = mongoose.model('challenges', challengesSchema);
module.exports = Challenge;