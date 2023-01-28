const User = require('../models/user');
const Lesson = require('../models/lessons');

//Home page
module.exports.lessonLinks = function (req, res) {

    let options = {
        title: "Home",
        username: req.user.username,
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
                                    res.render('lesson', options);
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

module.exports.countStars = async function (req, res) {
    if (req.xhr) {
        let stars = 0;
        User.findById(req.user.id, function (err, user) {
            if (user) {
                for (let i = 0; i < user.lessons.length; i++) {
                    if (user.lessons[i].level == req.query.level) {
                        stars = user.lessons[i].stars;
                        // console.log(stars);
                        break;
                    }
                }
                res.status(200).json({
                    data: {
                        stars: stars
                    },
                    message: `Star count sent`
                });
                stars = 0;
            }
        });
    }
}

module.exports.getScoreAndWPM = async function (req, res) {
    if (req.xhr) {
        User.findById(req.user.id, function (err, user) {
            if (err) { console.log(`Error while sending netScore and avgWPM`); return; }
            if (user) {
                res.status(200).json({
                    data: {
                        score: user.netLessonScore,
                        avgWPM: user.avgLessonWPM
                    },
                    message: 'Score and WPM sent'
                });
            }
            else {
                console.log(`User was not found`);
                return;
            }
        });
    }
}