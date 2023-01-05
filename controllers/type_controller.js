const User = require('../models/user');
const Lesson = require('../models/lessons');
let currentUser;

// Typing page rendering, TODO: Change later
// let para = `Oops, Seems your database doesn't have any paragraphs !`;
let para = `Oops, Seems there is no paragraph.`;
let paraLength = para.length;
let lessonId, lessonLvl;

module.exports.lesson = function (req, res, next) {
    let error = () => res.status(404).end('Page not found');

    Lesson.findOne({ level: req.query.level }, function (err, lesson) {
        if (err) { console.log(`Error while finding the lesson.`); error(); }
        if (lesson) {
            para = lesson.paragraph;
            paraLength = para.length;
            lessonId = lesson.id; //Storing the id of the lesson
            lessonLvl = req.query.level;
            return next();
        }
        else {
            console.log(`Couldn't find such lesson`);
            error();
        }
    });
}

module.exports.challenge = function (req, res, next) {
    para = "This paragraph comes from challenges collection";
    console.log(para);
}

module.exports.setCustomParagraph = function (paragraph, next) {
    para = paragraph;
    paraLength = para.length;
    console.log(para.substring(0, 15));
    next();
}



module.exports.type = function (req, res) {
    currentUser = req.user; //Storing the current logged user

    let options = {
        para: para
    }
    res.render('type', options);
}









let prevIndex = -1;
let wasBackspacePressed = false;
//Setting timers for users typing activity
let timer = [], wrongCount = 0;
let totalTimeToWritePara = 0;
let accuracy, grossSpeed, netSpeed;

// Reset everything on typing page
module.exports.typeRefresh = function (req, res) {
    prevIndex = -1;
    timer = [];
    totalTimeToWritePara = wrongCount = accuracy = grossSpeed = netSpeed = 0;
    // res.redirect('back');
    res.status(200).send({});
}


//When user finishes typing the paragraph
async function paraFinish() {
    console.log(currentUser);
    for (let i = 0; i < timer.length; i += 2) {
        totalTimeToWritePara += timer[i + 1] - timer[i];
    }
    totalTimeToWritePara = totalTimeToWritePara / 1000 / 60.0;
    if (totalTimeToWritePara < 0)
        totalTimeToWritePara = Infinity;

    if (wrongCount < 0)
        wrongCount = 0;

    //Calc Accuracy
    accuracy = 1.0 * (paraLength - wrongCount) / paraLength * 100;


    //Calc gross speed
    grossSpeed = paraLength / 5.0 / totalTimeToWritePara;

    //Calc net speed
    netSpeed = grossSpeed - wrongCount / totalTimeToWritePara;

    grossSpeed = Number.parseInt(grossSpeed);
    netSpeed = Number.parseInt(netSpeed);
    if (netSpeed < 0)
        netSpeed = Number.parseInt(0);

    // console.log(totalTimeToWritePara, grossSpeed, netSpeed, accuracy, wrongCount);

    if (lessonId) {
        let lessonDetails = {
            lesson: lessonId,
            grossSpeed: grossSpeed,
            netSpeed: netSpeed,
            accuracy: accuracy,
            level: lessonLvl,
            stars: calcStars(),
            netScore: calcScore()
        };

        // Function to calculate number of stars for typing
        function calcStars() {
            return 2;
        }
        function calcScore() {
            return 1;
        }


        //Saving the lesson progress

        let existingLesson = await currentUser.lessons.find(function (value, index) {
            return value.lesson == lessonId;
        });

        //Update if user is attempting a lesson again
        if (existingLesson) {
            if (existingLesson.stars <= lessonDetails.stars) {
                existingLesson.grossSpeed = lessonDetails.grossSpeed;
                existingLesson.netSpeed = lessonDetails.netSpeed;
                existingLesson.accuracy = lessonDetails.accuracy;
                existingLesson.level = lessonDetails.level;
                existingLesson.stars = lessonDetails.stars;
                // console.log(existingLesson);
            }
            else if (existingLesson.accuracy <= lessonDetails.accuracy) {
                existingLesson.grossSpeed = lessonDetails.grossSpeed;
                existingLesson.netSpeed = lessonDetails.netSpeed;
                existingLesson.accuracy = lessonDetails.accuracy;
                existingLesson.level = lessonDetails.level;
                existingLesson.stars = lessonDetails.stars;
            }
        }
        //Create lesson if user is attempting for first time
        else {
            currentUser.lessons.push(lessonDetails);
        }

        if (Number.parseInt(currentUser.avgWPM) != 0)
            currentUser.avgWPM = (Number.parseInt(currentUser.avgWPM) + Number.parseInt(lessonDetails.grossSpeed)) / 2.0;
        else
            currentUser.avgWPM = Number.parseInt(lessonDetails.grossSpeed);

        if (Number.parseInt(currentUser.netScore) != 0)
            currentUser.netScore = Number.parseInt(currentUser.netScore) + Number.parseInt(lessonDetails.netScore);
        else
            currentUser.netScore = Number.parseInt(lessonDetails.netScore);

        console.log(currentUser.avgWPM, currentUser.netScore);

        await currentUser.save(function (err, user) {
            if (err) { console.log(`Error while saving lesson progress`, err); return; }
            console.log(`Saved lesson progress`);
        });
    }

    //for challenge, calc score
    //Update rank
    //Update and Congratulate on league change
}


let pause = false;
module.exports.typeToggler = function (req, res, next) {
    if (pause == true)
        pause = false;
    else
        pause = true;
    timer.push(Date.now());
    next();
}
module.exports.typePause = function (req, res) {
    if (req.xhr) {
        res.status(200).json({
            data: { 'pause': pause },
            message: 'Pause button clicked'
        });
    }
}


module.exports.typeBackspace = function (req, res) {
    if (req.xhr) {
        if (req.body.prevCorrect && wrongCount >= 1) {
            wrongCount--;
            wasBackspacePressed = false;
        }
        else if (wrongCount >= 2) {
            wrongCount -= 2;
            wasBackspacePressed = true;
        }
        prevIndex = Number.parseInt(req.body.indexDone) - 1;
        res.status(200).json({
            data: {
                index: prevIndex
            },
            message: 'backspace handled'
        });
        if (prevIndex < -1)
            prevIndex = -1;
    }
}

module.exports.typeChanges = async function (req, res) {

    if (req.xhr) {

        prevIndex++;

        let c = correct(req.body.keyPressed, req.body.indexPressed);
        if (c == false)
            wrongCount++;

        if (prevIndex == 0) {
            timer.push(Date.now());
        }
        if (prevIndex == paraLength - 1) {
            timer.push(Date.now());
            await paraFinish();
        }

        res.status(200).json({
            data: {
                'indexDone': prevIndex,
                'correct': c
            },
            message: "Typed character catched"
        });
    }
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


module.exports.getUserLessonInfo = async function (req, res) {
    if (lessonId) {
        if (req.xhr) {
            let existingLesson = await currentUser.lessons.find(function (value, index) {
                return value.lesson == lessonId;
            });

            lessonId = undefined;

            res.status(200).json({
                data: {
                    grossSpeed: existingLesson.grossSpeed,
                    netSpeed: existingLesson.netSpeed,
                    accuracy: existingLesson.accuracy,
                    stars: existingLesson.stars
                },
                message: 'Lesson data sent'
            });
        }
    }
}