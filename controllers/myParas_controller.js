const User = require('../models/user');

module.exports.myParas = function (req, res) {
    let options = {
        title: 'My Paragraphs',
        paras: [],
        score: '?',
        stars: '?',
        avgSpeed: '?'
    }
    const user = req.user;
    options.paras = user.myParas.reverse();
    options.score = user.netMyParasScore;
    options.stars = user.myParasStars;
    options.avgSpeed = user.avgMyParasWPM;

    res.render('myParas', options);
}

module.exports.addByText = async function (req, res) {
    // console.log(req.body);
    let submittedText = req.body['submitted-text'];
    if (submittedText.length < 15) {
        req.flash('error', 'Text must be at least 15 letters long.');
        return res.redirect('back');
    }
    else {
        let myParasDetails = {
            paragraph: submittedText.replaceAll('\r\n', ' ').trim(),
            paraType: 'myParas',
            time: new Date(),
            grossSpeed: 0,
            netSpeed: 0,
            accuracy: 0,
            stars: 0,
            score: 0
        };
        let existing = await req.user.myParas.find(value => { return value.paragraph == submittedText; });
        if (existing) {
            req.flash('error', 'Paragraph already exists');
            return res.redirect('back');
        }

        req.user.myParas.push(myParasDetails);
        req.user.save(function (err, user) {
            if (err || !user) {
                req.flash('error', `Can't Add Paragraph`);
                return res.redirect('back');
            }
            else {
                req.flash('success', 'Paragraph Added');
                return res.redirect('/user/myParas');
            }
        });
    }
}


module.exports.addByFile = async function (req, res) {
    console.log(req.rawHeaders);
    res.redirect('back');
}


module.exports.deleteMyPara = async function (req, res) {
    if (req.xhr) {
        // console.log(req.body);
        const currentUser = req.user;
        let ind = -1;
        let foundPara = await currentUser.myParas.find((value, index) => {
            if (value.id == req.body.id) {
                ind = index;
                return true;
            }
            else
                return false;
        });

        if (ind == -1) {
            req.flash('error', `Couldn't delete Paragraph`);
            await res.json({
                data: {
                    deleted: false
                }
            });
        }
        else {
            await currentUser.myParas.splice(ind, 1);
            await currentUser.save(function (err, user) {
                if (err) { console.log('Error while deleting myPara', err); return; }
                else {
                    console.log('Deleted myPara');
                }
            });

            req.flash('success', 'Paragraph deleted');

            await res.json({
                data: {
                    deleted: true
                }
            });
        }
    }
}