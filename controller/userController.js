const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        // 2 days
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        user,
    });
};


// creating a user (taking a loan)
exports.createLoanRequest = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        phone,
        whatsappNumber,
        aadharCardNumber,
        loanAmount,
        tenure,
        loanType,
    } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !phone || !whatsappNumber || !aadharCardNumber || !loanAmount || !tenure || !loanType) {
        return next(new AppError("Please provide all required information for creating an account!", 400));
    }

    const newLoanRequest = await User.create({
        name,
        email,
        phone,
        whatsappNumber,
        aadharCardNumber,
        loanAmount,
        tenure,
        loanType,
    });

    if (!newLoanRequest) {
        return next(new AppError("Couldn't create user!", 500));
    }

    // res.status(200).json({
    //     status: "success",
    //     newLoanRequest
    // })
    createSendToken(newLoanRequest, 201, res);
})

// login (using phn number)
exports.login = catchAsync(async (req, res, next) => {
    const { phone } = req.body;

    if (!phone) {
        return next(new AppError("Please provide the registered phone number!", 400));
    }
    const user = await User.findOne({ phone });

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) fetch token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    console.log(token);

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded.id);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    console.log(currentUser);
    if (!currentUser) {
        return next(
            new AppError(
                "The user belonging to this token does no longer exist.",
                401
            )
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

// updating 3 fields bank, bank number, ifsc code
exports.updateDetails = catchAsync(async (req, res, next) => {
    const { bankname, bankAccountNumber, ifscCode } = req.body;
    const userID = req.user._id;

    const updatedLoanRequest = await User.findByIdAndUpdate(userID, {
        bankname, bankAccountNumber, ifscCode
    });

    if (!updatedLoanRequest) {
        return next(new AppError("Couldn't update the details!", 400));
    }

    res.status(200).json({
        status: "success",
        updatedLoanRequest
    })
});