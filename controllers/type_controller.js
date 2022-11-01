const User = require('../models/user');
const Lesson = require('../models/lessons');

// Typing page rendering, TODO: Change later
let para = "Oops, Seems your database doesn't have any paragraphs !";
let paraLength = para.length;

module.exports.lesson = function (req, res, next) {
    // para = "This paragraph comes from lesson collection";
    // console.log(para);
    let error = () => res.status(404).end('Page not found');

    Lesson.findOne({ level: req.query.level }, function (err, lesson) {
        if (err) { console.log(`Error while finding the lesson.`); error(); }
        if (lesson) {
            para = lesson.paragraph;
            paraLength = para.length;
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
    res.redirect('back');
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



//Setting timers for users typing activity
let beginTime, endTime;
function startTimer() {
    beginTime = Date.now();
}
function endTimer() {
    endTime = Date.now();
}

//When user finishes typing the paragraph
function paraFinish() {
    console.log(beginTime, endTime);
    console.log(endTime - beginTime);
    //Calc gross speed
    //Calc net speed
    //Calc Acc

    //for challenge, calc score
    //Update rank
    //Update and Congratulate on league change
}

module.exports.typeChanges = function (req, res) {

    if (req.xhr) {
        // Valid typing
        if (prevIndex === req.body.indexPressed - 1) {
            prevIndex++;

            if (prevIndex == 0)
                startTimer();
            if (prevIndex == paraLength - 1) {
                endTimer();
                paraFinish();
            }

            res.status(200).json({
                data: {
                    'indexDone': prevIndex,
                    'correct': correct(req.body.keyPressed, req.body.indexPressed)
                },
                message: "Message"
            });
        }

        // When user is trying to cheat by sending wrong indexPressed
        else {
            res.end('You have been BANNED for trying to cheat.');
        }
    }
}
