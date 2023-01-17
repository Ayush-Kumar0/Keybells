const express = require('express');
const router = express.Router();
const myParasController = require('../controllers/myParas_controller');
const passport = require('passport');

router.get('/', passport.checkAuthentication, myParasController.myParas);
router.post('/addByFile', passport.checkAuthentication, myParasController.addByFile);
router.post('/addByText', passport.checkAuthentication, myParasController.addByText);


module.exports = router;