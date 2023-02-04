const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');


// Tell passport to use a new strategy for google login
passport.use(new googleStrategy({
    clientID: process.env.ClientID,
    clientSecret: process.env.ClientSecret,
    callbackURL: process.env.CallbackURL,
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
                let email = profile.emails[0].value.toString();
                User.create({
                    name: profile.displayName,
                    username: email.substring(0, email.indexOf('@')),
                    email: profile.emails[0].value,
                    salt: salt,
                    password: crypto.pbkdf2Sync(password.toString('hex'), salt, 1000, 64, `sha512`).toString(`hex`),
                    lastTenSpeeds: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    avgLessonWPM: 0,
                    netLessonScore: 0,
                    lessonStars: 0,
                    unlockedLessons: 1,
                    avgRandomWPM: 0,
                    netRandomScore: 0,
                    randomStars: 0,
                    avgMyParasWPM: 0,
                    netMyParasScore: 0,
                    myParasStars: 0
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
