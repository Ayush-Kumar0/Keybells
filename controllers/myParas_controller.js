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

module.exports.addByFile = async function (req, res) {
    console.log(req.body);
    res.redirect('back');
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