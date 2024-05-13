const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const StaffModel = require("../models/staffModel");
const crypto = require("crypto");
const Email = require("../utils/Email");

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

    await new Email(newLoanRequest.name, newLoanRequest.email, newLoanRequest.phone, "", newLoanRequest._id, newLoanRequest.loanAmount, newLoanRequest.loanType, newLoanRequest.tenure).sendBookingInfo();

    createSendToken(newLoanRequest, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const { phone } = req.body;
    console.log(phone);

    if (!phone) {
        return next(new AppError("Please provide the registered phone number!", 400));
    }
    const user = await User.findOne({ phone: phone });
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
    }, {
        new: true,
        runValidators: true,
    });

    if (!updatedLoanRequest) {
        return next(new AppError("Couldn't update the details!", 400));
    }

    res.status(200).json({
        status: "success",
        updatedLoanRequest
    })
});

exports.getMyDetils = catchAsync(async (req, res, next) => {
    const userID = req.user._id;

    const user = await User.findById(userID).select("-totalRepayment -isProcessingFeePending -__v");

    if (!user) {
        return next(new AppError("User with this ID doesnt exit!! Contact support team!!", 400));
    }

    res.status(200).json({
        status: "success",
        user
    });
})


// <---------------------------STAFF---------------------------->

exports.staffSignup = catchAsync(async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return next(
            new AppError("Please provide all information for creating an account!!", 400)
        );
    }

    const newStaff = await StaffModel.create({
        name,
        email,
        phone,
        password
    });

    if (!newStaff) {
        return next(new AppError("Couldnt create staff!!"))
    }

    createSendToken(newStaff, 201, res);
});

exports.staffLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }

    const staff = await StaffModel.findOne({ email }).select("+password");

    if (!staff || !(await staff.correctPassword(password, staff.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(staff, 200, res);
});


exports.protectStaff = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await StaffModel.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                "The user belonging to this token does no longer exist.",
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("User recently changed password! Please log in again.", 401)
        );
    }

    req.user = currentUser;
    next();
});


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await StaffModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with email address.", 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    console.log(process.env.NODE_ENV);

    // 3) Send it to user's email
    try {
        const resetURL = `http://localhost:5173/reset-password/${resetToken}`

        console.log(resetURL);
        console.log(user);
        await new Email(user.name, user.email, user.phone, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError("There was an error sending the email. Try again later!"),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await StaffModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});