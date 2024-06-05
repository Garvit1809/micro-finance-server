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

router.patch("/request/:loanid/tds-details", staffController.updateTDSDetails);
router.patch("/request/:loanid/tds-invoice", staffController.updateTDSInvoice);

router.patch("/request/:loanid/gst-details", staffController.updateGSTDetails);
router.patch("/request/:loanid/gst-invoice", staffController.updateGSTInvoice);

router.patch("/request/:loanid/insurance-details", staffController.updateInsuranceDetails);
router.patch("/request/:loanid/insurance-invoice", staffController.updateInsuranceInvoice);

router.patch("/request/:loanid/noc-details", staffController.updateNOCDetails);
router.patch("/request/:loanid/noc-invoice", staffController.updateNOCInvoice);

router.patch("/request/:loanid/rbiHold-details", staffController.updateRBIHoldDetails);
router.patch("/request/:loanid/rbiHold-invoice", staffController.updateRBIHoldInvoice);

router.patch("/request/:loanid/uniqueCodeGenerate-details", staffController.updateUniqueCodeGenerateDetails);
router.patch("/request/:loanid/uniqueCodeGenerate-invoice", staffController.updateUniqueCodeGenerateInvoice);

router.get("/members", staffController.getAllStaff);

module.exports = router;