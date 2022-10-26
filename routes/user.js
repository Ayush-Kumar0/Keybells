const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const passport = require('passport');

//For a user
router.get('/', passport.checkAuthentication, userController.home);
router.get('/profile', passport.checkAuthentication, userController.profile)

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


//Exporting the router
module.exports = router;