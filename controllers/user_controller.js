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

// Typing page rendering, TODO: Change later
let para = "This Is the tEst#& ` ~=_':.,</  paRagraph 145 w3 t5M";
module.exports.type = function (req, res) {
    let options = {
        para: para
    }
    res.render('type', options);
}

let prevIndex = -1;
// Reset everything on typing page
module.exports.typeRefresh = function (req, res) {
    prevIndex = -1;
}

// This function enables features like Highlighting and Typing using AJAX
let correct = function (key, index) {
    let char = para.charAt(index);
    if (key == 'Backspace' || key == 'Shift Backspace' || key == 'Control Backspace' || key == 'Alt Backspace') {
        //TODO: Handle later
        return false;
    }
    else if (key == 'Tab' || key == 'Shift Tab' || key == 'Control Tab' || key == 'Alt Tab') {
        //TODO: Handle later
        return false;
    }
    else if (key == 'Enter' || key == 'Shift Enter' || key == 'Control Enter' || key == 'Alt Enter') {
        //TODO: Handle later
        return false;
    }
    else if (key == ' ') {
        if (key == char)
            return true;
        else
            return false;
    }
    else if (key == 'Shift  ' || key == 'Control  ' || key == 'Alt  ') {
        return false;
    }
    // Single character keys and their combinations
    else {
        key = key.split(' ');
        key = key[key.length - 1];
        if (key.length == 1) {
            let ascii = key.charCodeAt(0);
            // console.log(ascii);

            // //Capital Letter
            // if (ascii >= 65 && ascii <= 90) {
            //     if (key == char)
            //         return true;
            //     else
            //         return false;
            // }
            // //Small Letters
            // else if (ascii >= 97 && ascii <= 122) {
            //     if (key == char)
            //         return true;
            //     else
            //         return false;
            // }
            // //Number
            // else if (ascii >= 48 && ascii <= 57) {
            //     if (key == char)
            //         return true;
            //     else
            //         return false;
            // }
            if (key == char)
                return true;
        }
        return false;
    }
}
module.exports.typeChanges = function (req, res) {

    // Valid typing
    if (prevIndex === req.body.indexPressed - 1) {
        prevIndex++;
        // console.log(req.body.keyPressed);

        if (req.xhr) {
            res.status(200).json({
                data: {
                    'indexDone': prevIndex,
                    'correct': correct(req.body.keyPressed, req.body.indexPressed)
                },
                message: "Message"
            });
        }
    }
    // When user is trying to cheat by sending wrong indexPressed
    else {
        res.end('You have been BANNED for trying to cheat.');
    }
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