const express = require('express');
const router = express.Router();
const typeController = require('../controllers/type_controller');
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



module.exports = router;