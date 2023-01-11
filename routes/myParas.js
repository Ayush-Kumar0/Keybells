const express = require('express');
const router = express.Router();
const myParasController = require('../controllers/myParas_controller');
const passport = require('passport');

router.get('/', passport.checkAuthentication, myParasController.myParas);


module.exports = router;