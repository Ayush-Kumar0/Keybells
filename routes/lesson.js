const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson_controller');
const passport = require('passport');


router.get('/', passport.checkAuthentication, lessonController.lessonLinks);


router.get('/countLessonStars', passport.checkAuthentication, lessonController.countStars);
router.post('/getScoreAndWPM', passport.checkAuthentication, lessonController.getScoreAndWPM);


module.exports = router;