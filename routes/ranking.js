const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/ranking_controller');
const passport = require('passport');

router.get('/', passport.checkAuthentication, rankingController.ranking);


module.exports = router;