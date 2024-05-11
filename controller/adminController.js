const StaffModel = require("../models/staffModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

// get all loan requests
exports.getLoanRequests = catchAsync(async (req, res, next) => {
    const requests = await User.find().sort("-createdAt");

    res.status(200).json({
        status: "success",
        requests
    })
});

// get one loan request
exports.getOneLoanRequest = catchAsync(async (req, res, next) => {
    const loanID = req.params.loanid;

    if (!loanID) {
        return next(new AppError("Provide Booking ID!", 400))
    }

    const loanRequest = await User.findById(loanID);

    if (!loanRequest) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(200).json({
        status: "success",
        loanRequest
    })
})

// update rquest details
exports.updateBooking = catchAsync(async (req, res, next) => {
    const { name, email, phone, whatsappNumber, aadharCardNumber, panCardNumber, bankname, bankAccountNumber, ifscCode, loanAmount, tenure, loanType, interestRate, totalRepayment } = req.body;
    const loanID = req.params.loanid;

    if (!loanID) {
        return next(new AppError("Provide Loan Request ID!", 400))
    }

    const updatedLoanRequest = await User.findByIdAndUpdate(loanID, {
        name,
        email,
        phone,
        whatsappNumber,
        aadharCardNumber,
        panCardNumber,
        bankname,
        bankAccountNumber,
        ifscCode,
        loanAmount,
        tenure,
        loanType,
        interestRate,
        totalRepayment
    }, {
        new: true,
        runValidators: true,
    })

    if (!updatedLoanRequest) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(201).json({
        status: "success",
        updatedLoanRequest
    })
});

// approve step 1
// upload pdf
exports.updateFirstStep = catchAsync(async (req, res, next) => {
    const loanID = req.params.loanid;

    if (!loanID) {
        return next(new AppError("Provide Loan Request ID!", 400))
    }

    const updatedLoanRequest = await User.findByIdAndUpdate(loanID, {
        hasLoanRequestApproved: true
    }, {
        new: true,
        runValidators: true,
    })

    if (!updatedLoanRequest) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(201).json({
        status: "success",
        updatedLoanRequest
    })
});

// update step 2
exports.updateSecondStep = catchAsync(async (req, res, next) => {
    const loanID = req.params.loanid;

    if (!loanID) {
        return next(new AppError("Provide Loan Request ID!", 400))
    }

    const updatedLoanRequest = await User.findByIdAndUpdate(loanID, {
        isProcessingFeePending: true
    }, {
        new: true,
        runValidators: true,
    })

    if (!updatedLoanRequest) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(201).json({
        status: "success",
        updatedLoanRequest
    })
});

// get member
exports.getAllStaff = catchAsync(async (req, res, next) => {
    const members = await StaffModel.find();

    res.status(200).json({
        status: "success",
        members
    })
});