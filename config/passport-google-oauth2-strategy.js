const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');


// Tell passport to use a new strategy for google login
passport.use(new googleStrategy({
    clientID: '1022641242763-mlknri416p5tt1l58cphj861pf07a7m0.apps.googleusercontent.com', // e.g. asdfghjkkadhajsghjk.apps.googleusercontent.com
    clientSecret: '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', // e.g. _ASDFA%KFJWIASDFASD#FAD-
    callbackURL: "https://localhost:8000/user/auth/google/callback",
},

    function (accessToken, refreshToken, profile, done) {
        // Find the user in google
        User.findOne({ email: profile.emails[0].value }).exec(function (err, user) {
            if (err) { console.log('Error while finding the profile: ', err); return done(err); }
            console.log(accessToken, refreshToken);
            console.log(profile);

            if (user) {
                // If found, set this user as req.user
                console.log(`Google user found`);
                return done(null, user);
            }
            else {
                // If not found, create the user and set it as req.user
                let password = crypto.randomBytes(8).toString('hex');
                let salt = crypto.randomBytes(20).toString('hex');
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    salt: salt,
                    password: crypto.pbkdf2Sync(password.toString('hex'), salt, 1000, 64, `sha512`).toString(`hex`),
                    avgWPM: 0,
                    netScore:0
                },
                    // User.setPassword(crypto.randomBytes(20).toString('hex')),
                    function (err, user) {
                        if (err) { console.log('Error while creating user after google auth : ', err); return done(err); }

                        console.log(`Google user created`);
                        return done(null, user);
                    });
            }
        });
    }
));


module.exports = passport;
