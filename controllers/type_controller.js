const User = require('../models/user');
const Lesson = require('../models/lessons');
let currentUser;

// Typing page rendering, TODO: Change later
// let para = `Oops, Seems your database doesn't have any paragraphs !`;
let para = `Oops, Seems there is no paragraph.`;
let paraLength = para.length;
let lessonId, lessonLvl;
let randomId;

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
    randomId = 'random paragraph available';
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
let accuracy = 0, grossSpeed = 0, netSpeed = 0;

// Reset everything on typing page
module.exports.typeRefresh = function (req, res) {
    prevIndex = -1;
    timer = [];
    totalTimeToWritePara = wrongCount = accuracy = grossSpeed = netSpeed = 0;
    res.status(200).render('type', { para: para });
}


//When user finishes typing the paragraph
async function paraFinish() {
    // console.log(currentUser);
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

    console.log(totalTimeToWritePara, grossSpeed, netSpeed, accuracy, wrongCount);

    // Function to calculate number of stars for typing
    function calcStars() {
        return 2;
    }
    function calcScore() {
        return 1;
    }

    if (lessonId) {
        // Save details in Lesson
        let lessonDetails = {
            lesson: lessonId,
            grossSpeed: grossSpeed,
            netSpeed: netSpeed,
            accuracy: accuracy,
            level: lessonLvl,
            stars: calcStars(),
            netLessonScore: calcScore()
        };

        //Saving the lesson progress

        let existingLesson = await currentUser.lessons.find(function (value, index) {
            return value.lesson == lessonId;
        });

        //Update if user is attempting a lesson again
        if (existingLesson) {
            if (existingLesson.stars <= lessonDetails.stars) {
                currentUser.lessonStars += lessonDetails.stars - existingLesson.stars;
                existingLesson.grossSpeed = lessonDetails.grossSpeed;
                existingLesson.netSpeed = lessonDetails.netSpeed;
                existingLesson.accuracy = lessonDetails.accuracy;
                existingLesson.level = lessonDetails.level;
                existingLesson.stars = lessonDetails.stars;
                // console.log(existingLesson);
            }
            else if (existingLesson.accuracy <= lessonDetails.accuracy) {
                currentUser.lessonStars += lessonDetails.stars - existingLesson.stars;
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
            currentUser.lessonStars += lessonDetails.stars;
        }

        if (Number.parseInt(currentUser.avgLessonWPM) != 0)
            currentUser.avgLessonWPM = (Number.parseInt(currentUser.avgLessonWPM) + Number.parseInt(lessonDetails.grossSpeed)) / 2.0;
        else
            currentUser.avgLessonWPM = Number.parseInt(lessonDetails.grossSpeed);

        if (Number.parseInt(currentUser.netLessonScore) != 0)
            currentUser.netLessonScore = Number.parseInt(currentUser.netLessonScore) + Number.parseInt(lessonDetails.netLessonScore);
        else
            currentUser.netLessonScore = Number.parseInt(lessonDetails.netLessonScore);

        // console.log(currentUser.avgLessonWPM, currentUser.netLessonScore);

        await currentUser.save(function (err, user) {
            if (err) { console.log(`Error while saving lesson progress`, err); return; }
            console.log(`Saved lesson progress`);
        });
    }

    else if (randomId) {
        // Save details for Custom Paragraph
        let randomDetails = {
            paragraph: para,
            paraType: 'random',
            time: new Date(),
            grossSpeed: grossSpeed,
            netSpeed: netSpeed,
            accuracy: accuracy,
            stars: calcStars(),
            netRandomScore: calcScore()
        };

        // Search for existing Random Paragraph in user's database
        let existingRandom = await currentUser.random.find(function (value, index) {
            return para === value.paragraph;
        });

        if (existingRandom) {
            if (existingRandom.stars <= randomDetails.stars) {
                currentUser.randomStars += randomDetails.stars - existingRandom.stars;
                existingRandom.time = new Date();
                existingRandom.grossSpeed = randomDetails.grossSpeed;
                existingRandom.netSpeed = randomDetails.netSpeed;
                existingRandom.accuracy = randomDetails.accuracy;
                existingRandom.level = randomDetails.level;
                existingRandom.stars = randomDetails.stars;
            }
            else if (existingRandom.accuracy <= randomDetails.accuracy) {
                currentUser.randomStars += randomDetails.stars - existingRandom.stars;
                existingRandom.time = new Date();
                existingRandom.grossSpeed = randomDetails.grossSpeed;
                existingRandom.netSpeed = randomDetails.netSpeed;
                existingRandom.accuracy = randomDetails.accuracy;
                existingRandom.level = randomDetails.level;
                existingRandom.stars = randomDetails.stars;
            }
            console.log('Changed existing Random Paragraph');
        }
        else {
            currentUser.random.push(randomDetails);
            currentUser.randomStars += randomDetails.stars;
            console.log('Pushed Random Paragraph', randomDetails);
        }

        if (Number.parseInt(currentUser.avgRandomWPM) != 0)
            currentUser.avgRandomWPM = (Number.parseInt(currentUser.avgRandomWPM) + Number.parseInt(randomDetails.grossSpeed)) / 2.0;
        else
            currentUser.avgRandomWPM = Number.parseInt(randomDetails.grossSpeed);

        if (Number.parseInt(currentUser.netRandomScore) != 0)
            currentUser.netRandomScore = Number.parseInt(currentUser.netRandomScore) + Number.parseInt(randomDetails.netRandomScore);
        else
            currentUser.netRandomScore = Number.parseInt(randomDetails.netRandomScore);

        // console.log(currentUser.avgRandomWPM, currentUser.netRandomScore);

        await currentUser.save(function (err, user) {
            if (err) { console.log(`Error while saving random paragraph progress`, err); return; }
            console.log(`Saved random paragraph progress`);
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
        // Return details for completed Lesson
        if (req.xhr) {
            let existingLesson = await currentUser.lessons.find(function (value, index) {
                return value.lesson == lessonId;
            });

            lessonId = undefined;

            if (existingLesson) {
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
            else {
                console.log('Previous Lesson might not be saved.');
            }
        }
    }
    else if (randomId) {
        // Return details for completed Custom Paragraph
        if (req.xhr) {
            let existingRandom = await currentUser.random.find(function (value, index) {
                return para === value.paragraph;
            });

            randomId = undefined;

            if (existingRandom) {
                res.status(200).json({
                    data: {
                        grossSpeed: existingRandom.grossSpeed,
                        netSpeed: existingRandom.netSpeed,
                        accuracy: existingRandom.accuracy,
                        stars: existingRandom.stars
                    },
                    message: 'Random Paragraph data sent'
                });
            }
            else {
                console.log('Previous Random Paragraph might not be saved');
            }
        }
    }
}