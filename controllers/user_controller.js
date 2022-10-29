const User = require('../models/user');

//Home page
module.exports.home = function (req, res) {
    res.render('home');
}
module.exports.profile = function (req, res) {
    res.render('profile');
}
module.exports.challenges = function (req, res) {
    res.render('challenges');
}
module.exports.ranking = function (req, res) {
    res.render('ranking');
}

module.exports.create = function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        console.log(`Passwords don't match`);
        return res.redirect('back');
    }

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) { console.log(`Error while finding user`); return res.redirect('back'); }

        if (!user) {
            // User.create(req.body, function (err, user) {
            //     if (err) { console.log(`Error while creating new user`); return res.redirect('back'); }

            //     console.log(`Created new user`);
            //     return res.redirect('/sign-in');
            // }
            let newUser = new User();
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.setPassword(req.body.password);

            newUser.save(function (err, user) {
                if (err) { console.log(`Error while creating user`); return res.redirect('back'); }
                console.log(`Created new user`);
                return res.redirect('/sign-in');
            })
        }
        else {
            console.log(`Already a user`);
            return res.redirect('/sign-in');
        }

    });
}


module.exports.createSession = function (req, res) {
    res.redirect('/user');
}


module.exports.destroySession = function (req, res) {
    req.logout(function () {
        console.log(`User signed-out`);
        res.redirect('/');
    })
}