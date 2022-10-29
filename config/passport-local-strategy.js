const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');


passport.use(new localStrategy(
    {
        usernameField: 'email',
        passReqToCallback: true
    },
    function (req, email, password, done) {

        User.findOne({ 'email': email }, function (err, user) {
            if (err) { return console.log(`Error while finding the user`); }

            if (!user || user.checkPassword(password) == false) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));


//Serializing the user (which key to keep in cookies)
passport.serializeUser(function (user, done) {
    console.log(`User serealized`);
    done(null, user.id);
});

//Deserealizing the user from cookies (user identification using id in cookies)
passport.deserializeUser(function (id, done) {

    User.findById(id, function (err, user) {
        if (err) {
            console.log('Error in deserealizing the user');
            return done(err);
        }

        if (!user)
            console.log(`Deserealized User not found`);
        else
            console.log(`Deserealized user found`);

        return done(null, user);
    });
});






// Check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
    // If the user is signed in, then pass on the request to the next function(controller's action)
    if (req.isAuthenticated()) {
        return next();
    }

    // If the user is not signed in
    return res.end('You are not authenticated');
}



module.exports = passport;