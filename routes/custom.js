const express = require('express');
const router = express.Router();
const customController = require('../controllers/custom_controller');
const passport = require('passport');


router.get('/', passport.checkAuthentication, customController.custom);


router.get('/getRandomInfo', passport.checkAuthentication, customController.asideeInfo);
router.get('/getAllRandomParagraphs', passport.checkAuthentication, customController.getAllRandomParagraphs);


module.exports = router;