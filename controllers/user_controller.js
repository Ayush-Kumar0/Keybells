const User = require('../models/user');
const Lesson = require('../models/lessons');


//Home page
module.exports.home = function (req, res) {
    let options = {
        title: "Home",
        'alphabet': 0,
        'advanced-level1': 0,
        'shift': 0,
        'advanced-level2': 0,
        'numbers': 0,
        'advanced-level3': 0,
        'symbols': 0
    };

    //Getting number of documents of each type in lessons collection
    let countDocs = function () {
        Lesson.countDocuments({ 'paraType': 'alphabet' }, function (err, alphabet) {
            options['alphabet'] = alphabet;
            Lesson.countDocuments({ 'paraType': 'advanced-level1' }, function (err, advancedLevel1) {
                options['advanced-level1'] = advancedLevel1;
                Lesson.countDocuments({ 'paraType': 'shift' }, function (err, shift) {
                    options['shift'] = shift;
                    Lesson.countDocuments({ 'paraType': 'advanced-level2' }, function (err, advancedLevel2) {
                        options['advanced-level2'] = advancedLevel2;
                        Lesson.countDocuments({ 'paraType': 'numbers' }, function (err, numbers) {
                            options['numbers'] = numbers;
                            Lesson.countDocuments({ 'paraType': 'advanced-level3' }, function (err, advancedLevel3) {
                                options['advanced-level3'] = advancedLevel3;
                                Lesson.countDocuments({ 'paraType': 'symbols' }, function (err, symbols) {
                                    options['symbols'] = symbols;

                                    // Rendering the homepage
                                    res.render('home', options);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    countDocs();
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

            newUser.setPassword((req.body.password).toString());

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