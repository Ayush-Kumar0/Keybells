const express = require('express');
const router = express.Router();
const welcomeController = require('../controllers/welcome_controller');

//For welcome screen
router.get('/', welcomeController.home);

//Login/Logout routes
router.get('/sign-in', welcomeController.signIn);
router.get('/sign-up', welcomeController.signUp);



//For a user
router.use('/user', require('./user'));
//For a guest
router.use('/guest', require('./guest'));


//Exporting the router
module.exports = router;