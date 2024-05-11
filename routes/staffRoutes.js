const express = require("express");
const authController = require('../controller/userController');
const staffController = require('../controller/adminController');

const router = express.Router();

router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protectStaff);

router.get("/all-requests", staffController.getLoanRequests);
router.get("/request/:loanid", staffController.getOneLoanRequest);
router.patch("/request/:loanid", staffController.updateBooking);
router.patch("/request/:loanid/step-1", staffController.updateFirstStep);
router.patch("/request/:loanid/step-2", staffController.updateSecondStep);

router.get("/members", staffController.getAllStaff);

module.exports = router;