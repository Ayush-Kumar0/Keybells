const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guest_controller');

//For a guest
router.use('/', guestController.home);


//Exporting the router
module.exports = router;