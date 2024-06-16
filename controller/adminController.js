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
    const { name, email, phone, whatsappNumber, aadharCardNumber, panCardNumber, bankname, bankAccountNumber, ifscCode, loanAmount, tenure, loanType, interestRate, totalRepayment, paidOnBankName, paidOnAccountNumber, paidOnIFSCCode, isCurrentAccount } = req.body;
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
        totalRepayment,
        paidOnBankName,
        paidOnAccountNumber,
        paidOnIFSCCode,
        isCurrentAccount
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
exports.updateFirstStep = catchAsync(async (req, res, next) => {
    const loanID = req.params.loanid;
    // const { letterLink } = req.body;

    if (!loanID) {
        return next(new AppError("Provide Loan Request ID!", 400))
    }

    // if (letterLink === undefined) {
    //     return next(new AppError("Provide Loan Request ID!", 400))
    // }

    const updatedLoanRequest = await User.findByIdAndUpdate(loanID, {
        hasLoanRequestApproved: true,
        // approvalLetterLink: letterLink
    }, {
        new: true,
        runValidators: true,
    });

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
        isProcessingFeePending: false
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

// updating tax details
// uploading tax pdf
exports.updateTDSDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'tdsTax.value': amt,
                'tdsTax.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });

});

// exports.updateTDSInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             tdsInvoice: invoiceLink
//         },
//         {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });

// });


// gst update
// gst invoice upload
exports.updateGSTDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'gstTax.value': amt,
                'gstTax.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });

});

// exports.updateGSTInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             gstInvoice: invoiceLink
//         },
//         {
//             new: true,
//             runValidators: true
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });
// });

// updating insurance
// uploading insurance invoice
exports.updateInsuranceDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'insurance.value': amt,
                'insurance.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });

});

// exports.updateInsuranceInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             insuranceInvoice: invoiceLink
//         },
//         {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });

// });

// updating noc
// uploading noc invoice
exports.updateNOCDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'noc.value': amt,
                'noc.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });
});

// exports.updateNOCInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             nocInvoice: invoiceLink
//         },
//         {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });
// });


// updating rbiHold
// uploading rbiHold invoice
exports.updateRBIHoldDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'rbiHold.value': amt,
                'rbiHold.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });
});

// exports.updateRBIHoldInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             rbiHoldInvoice: invoiceLink
//         },
//         {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });
// });


// updating Unique Code Generate
// uploading uniqueCodeGenerate invoice
exports.updateUniqueCodeGenerateDetails = catchAsync(async (req, res, next) => {
    const { amt, status } = req.body;
    const bookingID = req.params.loanid;

    if (amt === undefined || status === undefined) {
        return next(new AppError("Please provide sufficient info!", 401));
    }

    // Find the user by ID and update the TDS tax values
    const updatedBooking = await User.findByIdAndUpdate(
        bookingID,
        {
            $set: {
                'uniqueCodeGenerate.value': amt,
                'uniqueCodeGenerate.status': status
            }
        },
        {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }
    );

    // If the user is not found, throw an error
    if (!updatedBooking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Send the updated booking details as a response
    res.status(200).json({
        status: 'success',
        data: {
            booking: updatedBooking
        }
    });
});

// exports.updateUniqueCodeGenerateInvoice = catchAsync(async (req, res, next) => {
//     const { invoiceLink } = req.body;
//     const bookingID = req.params.loanid;

//     if (invoiceLink === undefined) {
//         return next(new AppError("Please provide sufficient info!", 401));
//     }

//     // Find the user by ID and update the TDS tax values
//     const updatedBooking = await User.findByIdAndUpdate(
//         bookingID,
//         {
//             uniqueCodeGenerateInvoice: invoiceLink
//         },
//         {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         }
//     );

//     // If the user is not found, throw an error
//     if (!updatedBooking) {
//         return next(new AppError('No booking found with that ID', 404));
//     }

//     // Send the updated booking details as a response
//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking: updatedBooking
//         }
//     });
// });
