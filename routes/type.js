const express = require('express');
const router = express.Router();
const typeController = require('../controllers/type_controller');
const paragraphGenerator = require('../controllers/paragraph_generator');
const passport = require('passport');


// "/user/type?which=lesson" or "/user/type?which=challenge"
let lessonOrChallenge = function (req, res, next) {
    if (req.query.which == 'lesson')
        typeController.lesson(req, res, next);
    else if (req.query.which == 'challenge')
        typeController.challenge(req, res, next);
    else
        next();
}

// "/user/type"
router.get('/', passport.checkAuthentication, lessonOrChallenge, typeController.type);
router.get('/refresh', passport.checkAuthentication, typeController.typeRefresh);
router.post('/changes', passport.checkAuthentication, typeController.typeChanges);
router.post('/pause', passport.checkAuthentication, typeController.typeToggler, typeController.typePause);
router.post('/backspace', passport.checkAuthentication, typeController.typeBackspace);
router.post('/getUserLessonInfo', passport.checkAuthentication, typeController.getUserLessonInfo);


// Random paragraphs
router.get('/generateParagraph', passport.checkAuthentication, paragraphGenerator.generateParagraph, typeController.type);
router.get('/generateFacts', passport.checkAuthentication, paragraphGenerator.generateFacts, typeController.type);
router.get('/renderHistoryPara', passport.checkAuthentication, paragraphGenerator.renderHistoryPara, typeController.type);



module.exports = router;