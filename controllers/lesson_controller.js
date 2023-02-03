const User = require('../models/user');
const Lesson = require('../models/lessons');

//Home page
module.exports.lessonLinks = async function (req, res) {

    let options = {
        title: "Home",
        username: req.user.username,
        unlockedLessons: req.user.unlockedLessons,
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

    // let countDocs = async function () {
    //     Lesson.countDocuments({ 'paraType': 'alphabet' }, async function (err, alphabet) {
    //         options['alphabet'] = alphabet;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'advanced-level1' }, async function (err, advancedLevel1) {
    //         options['advanced-level1'] = advancedLevel1;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'shift' }, async function (err, shift) {
    //         options['shift'] = shift;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'advanced-level2' }, async function (err, advancedLevel2) {
    //         options['advanced-level2'] = advancedLevel2;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'numbers' }, async function (err, numbers) {
    //         options['numbers'] = numbers;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'advanced-level3' }, async function (err, advancedLevel3) {
    //         options['advanced-level3'] = advancedLevel3;
    //     });
    //     Lesson.countDocuments({ 'paraType': 'symbols' }, async function (err, symbols) {
    //         options['symbols'] = symbols;
    //     });

    // }

    await countDocs();
}

module.exports.countStars = async function (req, res) {
    if (req.xhr) {
        let stars = 0;
        User.findById(req.user.id, async function (err, user) {
            if (user) {
                for (let i = 0; i < user.lessons.length; i++) {
                    if (user.lessons[i].lesson == req.query.id) {
                        stars = user.lessons[i].stars;
                        // console.log(stars);
                        break;
                    }
                }
                await res.status(200).json({
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

module.exports.getLessonIds = async function (req, res) {
    if (req.xhr) {
        unlockedLessons = 1;
        // Find the user
        User.findById(req.user.id, async function (err, user) {
            if (err) { console.log(`Error while sending netScore and avgWPM`); return; }
            if (user) {
                unlockedLessons = user.unlockedLessons;
                // console.log(unlockedLessons);
                let lessonIds = [];
                // Fetch first x documents from Lesson collection
                let foundLessons = await Lesson.find({}).limit(unlockedLessons);
                await foundLessons.forEach(async function (value, index) {
                    // Store ids of lesson's documents
                    lessonIds.push(value._id);
                });
                // Send the count of unlocked lessons and their ids
                await res.status(200).json({
                    data: {
                        unlockedLessons: unlockedLessons,
                        lessonIds: lessonIds
                    },
                    message: 'Number of unlocked lessons and their ids sent'
                });
                return;
            }
        });
    }
}