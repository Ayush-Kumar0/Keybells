const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const passport = require('passport');

//For a user
//Change later
router.get('/', passport.checkAuthentication, require('../controllers/lesson_controller').lessonLinks);

//For a profile
router.use('/profile', require('./profile'));

//For a lesson
router.use('/lesson', require('./lesson'));

//For a custom
router.use('/custom', require('./custom'));

//For challenges
router.use('/challenges', require('./challenges'));

//For rankings
router.use('/ranking', require('./ranking'));

//For typing page
router.use('/type', require('./type'));


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