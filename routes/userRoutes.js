const express = require("express");
const userController = require('../controller/userController');
// const userController = require('../controller/adminController');

const router = express.Router();

router.post('/apply-loan', userController.createLoanRequest);
router.post('/check-status', userController.login);
router.get('/my-details', userController.protect, userController.getMyDetils);
router.patch('/update-loan-details', userController.protect, userController.updateDetails);


module.exports = router;