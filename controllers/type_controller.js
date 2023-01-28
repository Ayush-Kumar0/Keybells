const User = require('../models/user');
const Lesson = require('../models/lessons');
var currentUser;

// Typing page rendering, TODO: Change later
// let para = `Oops, Seems your database doesn't have any paragraphs !`;
var para = `Oops, Seems there is no paragraph.`;
let paraLength = para.length;
let lessonId, lessonLvl;
let randomId;
let myParasId;

module.exports.lesson = async function (req, res, next) {
    let error = () => res.status(404).end('Page not found');

    Lesson.findOne({ level: req.query.level }, await function (err, lesson) {
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

module.exports.challenge = async function (req, res, next) {
    para = "This paragraph comes from challenges collection";
    // console.log(para);
}

module.exports.myParas = async function (req, res, next) {
    let error = () => res.status(404).end('Page not found');

    const user = req.user;
    // let x = await user.myParas.find((value, index) => {
    //     return String.valueOf(value.id) == String.valueOf(req.query.id);
    // });
    let x;
    await (async function () {
        for (let i = 0; i < user.myParas.length; i++) {
            if (user.myParas[i].id == req.query.id) {
                x = user.myParas[i];
                // console.log(x);
                return (new Promise((resolve, reject) => {
                    resolve(null);
                }).then((value) => { return value; }));
            }
        }
    })();
    // console.log(x);

    if (!x || !x.paragraph)
        error();
    else {
        para = x.paragraph;
        paraLength = para.length;
        myParasId = x._id;
        // console.log(req.query, myParasId);
        next();
        return;
    }
}

module.exports.setCustomParagraph = function (paragraph, next) {
    if (paragraph)
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
var timer = [], wrongCount = 0;
var totalTimeToWritePara = 0;
var accuracy = 0, grossSpeed = 0, netSpeed = 0;

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
    let i = 0;
    for (i = 0; i < timer.length; i += 2) {
        if (Number.isNaN(timer[i + 1]) || Number.isNaN(timer[i]))
            break;
        totalTimeToWritePara += timer[i + 1] - timer[i];
    }
    totalTimeToWritePara = totalTimeToWritePara / 1000 / 60.0;
    if (totalTimeToWritePara < 0 || Number.isNaN(totalTimeToWritePara))
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

    // Function to calculate number of stars for typing
    let score = 0, stars = 0;
    const MIN = 0, MAX = 120;
    const factor = 2500.0 / MAX;
    grossSpeed = Number.parseInt(grossSpeed);
    accuracy = Number.parseFloat(accuracy);

    score = grossSpeed * factor * accuracy / 100.0 * 1.1;
    if (score > 2500)
        score = 2500;
    stars = Number.parseFloat(score) / 500;
    score = score.toFixed(0);
    stars = stars.toFixed(0);
    // console.log(score, stars);

    if (lessonId) {
        // Save details in Lesson
        let lessonDetails = {
            lesson: lessonId,
            grossSpeed: grossSpeed,
            netSpeed: netSpeed,
            accuracy: accuracy,
            level: lessonLvl,
            stars: stars,
            score: score
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
            currentUser.netLessonScore = Number.parseInt(currentUser.netLessonScore) + Number.parseInt(lessonDetails.score);
        else
            currentUser.netLessonScore = Number.parseInt(lessonDetails.score);

        // console.log(currentUser.avgLessonWPM, currentUser.netLessonScore);
        await saveSpeedInQueue(lessonDetails.grossSpeed);

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
            stars: stars,
            score: score
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
                existingRandom.score = randomDetails.score;
            }
            else if (existingRandom.accuracy <= randomDetails.accuracy) {
                currentUser.randomStars += randomDetails.stars - existingRandom.stars;
                existingRandom.time = new Date();
                existingRandom.grossSpeed = randomDetails.grossSpeed;
                existingRandom.netSpeed = randomDetails.netSpeed;
                existingRandom.accuracy = randomDetails.accuracy;
                existingRandom.level = randomDetails.level;
                existingRandom.stars = randomDetails.stars;
                existingRandom.score = randomDetails.score;
            }
            console.log('Changed existing Random Paragraph');
        }
        else {
            currentUser.random.push(randomDetails);
            currentUser.randomStars += randomDetails.stars;
            // console.log('Pushed Random Paragraph', randomDetails);
        }

        if (Number.parseInt(currentUser.avgRandomWPM) != 0)
            currentUser.avgRandomWPM = (Number.parseInt(currentUser.avgRandomWPM) + Number.parseInt(randomDetails.grossSpeed)) / 2.0;
        else
            currentUser.avgRandomWPM = Number.parseInt(randomDetails.grossSpeed);

        if (Number.parseInt(currentUser.netRandomScore) != 0)
            currentUser.netRandomScore = Number.parseInt(currentUser.netRandomScore) + Number.parseInt(randomDetails.score);
        else
            currentUser.netRandomScore = Number.parseInt(randomDetails.score);

        // console.log(currentUser.avgRandomWPM, currentUser.netRandomScore);
        await saveSpeedInQueue(lessonDetails.grossSpeed);

        await currentUser.save(function (err, user) {
            if (err) { console.log(`Error while saving random paragraph progress`, err); return; }
            console.log(`Saved random paragraph progress`);
        });
    }

    else if (myParasId) {
        // Save details for Users Added Paragraph
        let myParasDetails = {
            paragraph: para,
            paraType: 'myParas',
            time: new Date(),
            grossSpeed: grossSpeed,
            netSpeed: netSpeed,
            accuracy: accuracy,
            stars: stars,
            score: score
        };

        // Search for existing Random Paragraph in user's database
        let existingMyParas = await currentUser.myParas.find(function (value, index) {
            return myParasId === value._id;
        });

        if (existingMyParas) {
            if (existingMyParas.stars <= myParasDetails.stars) {
                currentUser.myParasStars += myParasDetails.stars - existingMyParas.stars;
                existingMyParas.time = new Date();
                existingMyParas.grossSpeed = myParasDetails.grossSpeed;
                existingMyParas.netSpeed = myParasDetails.netSpeed;
                existingMyParas.accuracy = myParasDetails.accuracy;
                existingMyParas.level = myParasDetails.level;
                existingMyParas.stars = myParasDetails.stars;
                existingMyParas.score = myParasDetails.score;
            }
            else if (existingMyParas.accuracy <= myParasDetails.accuracy) {
                currentUser.myParasStars += myParasDetails.stars - existingMyParas.stars;
                existingMyParas.time = new Date();
                existingMyParas.grossSpeed = myParasDetails.grossSpeed;
                existingMyParas.netSpeed = myParasDetails.netSpeed;
                existingMyParas.accuracy = myParasDetails.accuracy;
                existingMyParas.level = myParasDetails.level;
                existingMyParas.stars = myParasDetails.stars;
                existingMyParas.score = myParasDetails.score;
            }
            console.log('Changed existing User Added Paragraph');
        }
        else {
            currentUser.myParas.push(myParasDetails);
            currentUser.myParasStars += myParasDetails.stars;
            // console.log('Pushed Users Added Paragraph', myParasDetails);
        }

        if (Number.parseInt(currentUser.avgMyParasWPM) != 0) {
            currentUser.avgMyParasWPM = (Number.parseInt(currentUser.avgMyParasWPM) + Number.parseInt(myParasDetails.grossSpeed)) / 2.0;
        }
        else {
            currentUser.avgMyParasWPM = Number.parseInt(myParasDetails.grossSpeed);
        }

        if (Number.parseInt(currentUser.netMyParasScore) != 0)
            currentUser.netMyParasScore = Number.parseInt(currentUser.netMyParasScore) + Number.parseInt(myParasDetails.score);
        else
            currentUser.netMyParasScore = Number.parseInt(myParasDetails.score);

        await saveSpeedInQueue(lessonDetails.grossSpeed);

        await currentUser.save(function (err, user) {
            if (err) { console.log(`Error while saving user added paragraph progress`, err); return; }
            console.log(`Saved user added paragraph progress`);
        });
    }

    //for challenge, calc score
    //Update rank
    //Update and Congratulate on league change
}


let pause = false;
module.exports.typeToggler = function (req, res, next) {
    timer.push(Date.now());
    if (pause == true)
        pause = false;
    else
        pause = true;
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
            // let ascii = key.charCodeAt(0);
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
    else if (myParasId) {
        // Return details for completed Users Added Paragraph
        if (req.xhr) {
            let existingMyParas = await currentUser.myParas.find(function (value, index) {
                return myParasId === value._id;
            });


            myParasId = undefined;

            if (existingMyParas) {
                res.status(200).json({
                    data: {
                        grossSpeed: existingMyParas.grossSpeed,
                        netSpeed: existingMyParas.netSpeed,
                        accuracy: existingMyParas.accuracy,
                        stars: existingMyParas.stars
                    },
                    message: 'Users Added Paragraph data sent'
                });
            }
            else {
                console.log('Previous Users Added Paragraph might not be saved');
            }
        }
    }
}




const saveSpeedInQueue = async function (speed) {
    if (speed && !Number.isNaN(speed) && Number.parseFloat(speed) > 0) {
        let lastTenSpeeds = currentUser.lastTenSpeeds;
        lastTenSpeeds.splice(0, 1)
        lastTenSpeeds.push(Number.parseFloat(speed).toFixed(0));
        currentUser.lastTenSpeeds = lastTenSpeeds;
    }
}