const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const passport = require('passport');

//For a user
router.get('/', passport.checkAuthentication, userController.home);
router.get('/profile', passport.checkAuthentication, userController.profile);
router.get('/custom', passport.checkAuthentication, userController.custom);
router.get('/challenges', passport.checkAuthentication, userController.challenges);
router.get('/ranking', passport.checkAuthentication, userController.ranking);


//For typing page
router.use('/type', require('./type'));

router.get('/countLessonStars', passport.checkAuthentication, userController.countStars);
router.post('/getScoreAndWPM', passport.checkAuthentication, userController.getScoreAndWPM);

// Sign-up
router.post('/create', userController.create);

// Sign-in
router.post('/create-session',
    passport.authenticate(
        'local',
        { failureRedirect: '/sign-in' }),
    userController.createSession);

// Sign-out
router.get('/sign-out', userController.destroySession);

//Google authentication routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/sign-in', failureMessage: true }), userController.createSession);


//Exporting the router
module.exports = router;