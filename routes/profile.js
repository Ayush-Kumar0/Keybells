const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_controller');
const passport = require('passport');


router.get('/', passport.checkAuthentication, profileController.profile);


module.exports = router;