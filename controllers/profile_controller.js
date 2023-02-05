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
                    isGuest: req.user == undefined || req.user.username != req.query.username,
                    user: userDetails
                };
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
            // Upload a temporary file to server
            const avatarName = avatar.name.substring(0, avatar.name.lastIndexOf('.')) + '-' + (Date.now()) + avatar.name.substring(avatar.name.lastIndexOf('.'));
            // console.log(avatarName);
            const uploadPath = __dirname + `/../uploads/users/avatars/` + avatarName;
            await avatar.mv(uploadPath);

            // Uploading file to Drive
            const GDCredPath = process.env.GDCred;
            const Scopes = [`https://www.googleapis.com/auth/drive`];
            const auth = new google.auth.GoogleAuth({ keyFile: GDCredPath, scopes: Scopes });

            await createAndUploadFile(auth);

            // Upload file to Drive
            async function createAndUploadFile(auth) {
                // Create auto autherization handler object
                const driveService = google.drive({ version: 'v3', auth });
                // create file metadata
                let fileMetaData = {
                    'name': avatarName,
                    'parents': [`1use1uwpBJAH7EDQJAmNmoXYmOdnxRzvP`] // Folder: Drive/KeybellsUploads/users/avatars
                };
                // create file data stream
                let media = {
                    mimeType: 'image/png, image/jpg, image/svg',
                    body: fs.createReadStream(uploadPath)
                };
                // Get drive's response
                let driveRes = await driveService.files.create({
                    resource: fileMetaData,
                    media: media,
                    fields: `id`
                });

                // Handle the response
                if (driveRes.status == 200) {
                    req.flash('succes', 'Avatar changed');
                }
                else {
                    req.flash('error', 'Error occured while uploading');
                }
                // console.log(driveRes);

                // Delete temporary file on server
                if (fs.existsSync(uploadPath))
                    fs.unlinkSync(uploadPath);
            }
        }
    }
    res.redirect('back');
}