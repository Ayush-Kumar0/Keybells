const passport = require('passport');

//Welcome page
module.exports.home = function (req, res) {
    if (req.isAuthenticated()) {
        console.log('User is already logged in');
        return res.redirect('/user');
    }
    res.render('welcome');
}


module.exports.signIn = function (req, res) {
    res.render('login');
}


module.exports.signUp = function (req, res) {
    res.render('signup');
}
