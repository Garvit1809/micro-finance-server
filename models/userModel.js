const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    whatsappNumber: {
        type: String,
        required: true,
    },
    aadharCardNumber: {
        type: String,
        required: true,
        // unique: true,
    },
    panCardNumber: {
        type: String,
        default: null
        // required: true,
    },
    bankname: {
        type: String,
        default: null,
    },
    bankAccountNumber: {
        type: String,
        default: null,
    },
    ifscCode: {
        type: String,
        default: null,
    },
    loanAmount: {
        type: String,
        default: null,
    },
    tenure: {
        type: String,
        enum: [
            '1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years',
            '8 Years', '9 Years', '10 Years', '11 Years', '12 Years', '13 Years',
            '14 Years', '15 Years', '16 Years', '17 Years', '18 Years', '19 Years', '20 Years'
        ],
        required: true
    },
    loanType: {
        type: String,
        enum: [
            'Personal Loan', 'Business Loan', 'Agriculture Loan', 'Mark-Sheet Loan',
            'Home Loan', 'Education Loan', 'Loan Against Property', 'Commercial Vehicle Loan',
            'Other'
        ],
        required: true
    },
    interestRate: {
        type: String,
        default: null,
    },
    payableInterest: {
        type: String,
        default: null,
    },
    emi: {
        type: String,
        default: null,
    },
    hasLoanRequestApproved: {
        type: Boolean,
        default: false,
    },
    isProcessingFeePending: {
        type: Boolean,
        default: true,
    },
    totalRepayment: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

// Avoid recreating model if it already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;