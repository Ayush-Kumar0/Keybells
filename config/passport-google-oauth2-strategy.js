const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');


// Tell passport to use a new strategy for google login
passport.use(new googleStrategy({
    clientID: '1022641242763-mlknri416p5tt1l58cphj861pf07a7m0.apps.googleusercontent.com', // e.g. asdfghjkkadhajsghjk.apps.googleusercontent.com
    clientSecret: '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', // e.g. _ASDFA%KFJWIASDFASD#FAD-
    callbackURL: "http://localhost:8000/user/auth/google/callback",
},

    function (accessToken, refreshToken, profile, done) {
        // Find the user in google
        User.findOne({ email: profile.emails[0].value }).exec(function (err, user) {
            if (err) { console.log('Error while finding the profile: ', err); return done(err); }
            console.log(accessToken, refreshToken);
            console.log(profile);

            if (user) {
                // If found, set this user as req.user
                return done(null, user);
            }
            else {
                // If not found, create the user and set it as req.user
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex')
                }, function (err, user) {
                    if (err) { console.log('Error while creating user after google auth : ', err); return done(err); }

                    return done(null, user);
                });
            }
        });
    }
));


module.exports = passport;
