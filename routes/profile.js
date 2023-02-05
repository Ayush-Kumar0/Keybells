const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile_controller');
const passport = require('passport');


router.get('/', profileController.profile);

router.post('/changeAvatar', passport.checkAuthentication, profileController.changeAvatar);


module.exports = router;