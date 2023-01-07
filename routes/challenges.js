const express = require('express');
const router = express.Router();
const challengesController = require('../controllers/challenges_controller');
const passport = require('passport');

router.get('/', passport.checkAuthentication, challengesController.challenges);


module.exports = router;