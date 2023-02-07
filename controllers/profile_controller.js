const User = require('../models/user');
const Lesson = require('../models/lessons');

const fs = require('fs');
const { google } = require('googleapis');

module.exports.profile = async function (req, res) {
    let userDetails = {
        FullName: '?',
        OverallTypingSpeed: '?',
        UsingSince: '?',
        OverallStars: '?',
        OverallScore: '?',
        // Lesson Details
        LessonSpeed: '?',
        LessonScore: '?',
        LessonStars: '?',
        Progress: '?',
        // Custom Details
        CustomSpeed: '?',
        CustomScore: '?',
        CustomStars: '?',
        TriedCount: '?',
        //My Paragraph Details
        MyParaSpeed: '?',
        MyParaScore: '?',
        MyParaStars: '?',
        Total: '?'
    };
    User.findOne({ username: req.query.username }, async (err, user) => {
        if (err || !user) {
            res.end('<h1 style="text-align:center">No Such User Found</h1>');
            return;
        } else {

            await (async function () {
                // User Details
                userDetails.FullName = user.name;
                let sumOfSpeeds = 0.0, count = 0;
                for (let i = 0; i < user.lastTenSpeeds.length; i++) {
                    if (user.lastTenSpeeds[i] != null && user.lastTenSpeeds[i] != '0' && user.lastTenSpeeds != 0) {
                        count++;
                        sumOfSpeeds = sumOfSpeeds + Number.parseFloat(user.lastTenSpeeds[i]);
                    }
                }
                userDetails.OverallTypingSpeed = count == 0 ? 0 : (sumOfSpeeds / count).toFixed(0);
                let creationDate = new Date(user.createdAt);
                function formatTime(date) {
                    date = new Date(date);
                    let dat = date.getDate();
                    let mon = date.getMonth();
                    let year = date.getYear() + 1900;
                    const Months = ["January", 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    let timeDif = Date.now() - date.getTime();
                    let daysDif = Math.ceil(timeDif * 1.0 / (1000 * 60 * 60 * 24));
                    let monthsDif = (daysDif / 31).toFixed(0);
                    daysDif %= 31;
                    let yearsDif = (monthsDif / 12).toFixed(0);
                    monthsDif %= 12;
                    let elapseTime = ' (';
                    if (yearsDif != 0)
                        elapseTime += `${yearsDif} year`;
                    if (monthsDif != 0) {
                        if (elapseTime != ' (')
                            elapseTime += ', ';
                        elapseTime += `${monthsDif} month`;
                        if (monthsDif > 1)
                            elapseTime += 's';
                    }
                    if (daysDif != 0) {
                        if (elapseTime != ' (')
                            elapseTime += ', ';
                        elapseTime += `${daysDif} day`;
                        if (daysDif > 1)
                            elapseTime += 's';
                    }
                    elapseTime += ')';
                    return '' + dat + ' ' + Months[mon] + ', ' + year + elapseTime;
                }
                userDetails.UsingSince = formatTime(creationDate);
                userDetails.OverallStars = Number.parseInt(user.lessonStars) + Number.parseInt(user.randomStars) + Number.parseInt(user.myParasStars);
                userDetails.OverallScore = Number.parseInt(user.netLessonScore) + Number.parseInt(user.netRandomScore) + Number.parseInt(user.netMyParasScore);
                // Lesson Details
                userDetails.LessonSpeed = user.avgLessonWPM;
                userDetails.LessonScore = user.netLessonScore;
                userDetails.LessonStars = user.lessonStars;
                // Custom Details
                userDetails.CustomSpeed = user.avgRandomWPM;
                userDetails.CustomScore = user.netRandomScore;
                userDetails.CustomStars = user.randomStars;
                userDetails.TriedCount = user.random.length;
                // MyParas Details
                userDetails.MyParaSpeed = user.avgMyParasWPM;
                userDetails.MyParaScore = user.netMyParasScore;
                userDetails.MyParaStars = user.myParasStars;
                userDetails.Total = user.myParas.length;
            })();

            Lesson.count({}, async (err, totalLessons) => {
                count = totalLessons;
                if (count == 0)
                    count = 1;
                userDetails.Progress = Number.parseInt(user.lessonStars) * 1.0 / count;
                let options = {
                    username: req.query.username,
                    avatar: "/images/profile_home/test1.jpg",
                    isGuest: req.user == undefined || req.user.username != req.query.username,
                    user: userDetails
                };

                const oldAvatar = __dirname + `/../uploads/users/avatars/` + req.user.avatar;
                if (req.user.avatar && fs.existsSync(oldAvatar) && fs.statSync(oldAvatar).isFile()) {
                    options.avatar = '/users/avatars/' + req.user.avatar;
                }
                return res.render('profile', options);
            });
        }
    });
}


module.exports.changeAvatar = async function (req, res) {
    if (!req.files || !req.files.avatar) {
        req.flash('error', 'No files were Uploaded');
    }
    else {
        let avatar = req.files.avatar;
        if (avatar.mimetype != 'image/png' && avatar.mimetype != 'image/jpg' && avatar.mimetype != 'image/svg') {
            req.flash('error', 'Incorrect Image format');
        }
        else {
            const avatarName = req.user.username + '-' + (Date.now()) + avatar.name.substring(avatar.name.lastIndexOf('.'));
            // console.log(avatarName);
            const uploadPath = __dirname + `/../uploads/users/avatars/`;

            // Deleting old avatar
            const oldAvatar = req.user.avatar;
            if (req.user.avatar && fs.existsSync(uploadPath + oldAvatar) && fs.statSync(uploadPath + oldAvatar).isFile()) {
                fs.unlinkSync(uploadPath + oldAvatar);
            }

            // Uploading new avatar
            await avatar.mv(uploadPath + avatarName);
            // Update name of avatar
            req.user.avatar = avatarName;

            // Save to database
            await req.user.save(function (err, user) {
                if (err) {
                    console.log(`Error while saving avatar`, err);
                    req.flash('error', 'Unknown error');
                    return;
                }
                console.log(`Saved avatar`);
                req.flash('success', 'Avatar changed');
            });
        }
    }
    res.redirect('back');
}

module.exports.fileTooBig = function (req, res) {
    if (req.xhr) {
        req.flash('error', 'File exceeds 10MB');
        res.redirect('back');
    }
}