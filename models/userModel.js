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
        unique: true,
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
        type: Number,
        default: null,
    },
    // calculated in pre hook
    payableInterest: {
        type: Number,
        default: null,
    },
    // calc in pre hook
    emi: {
        type: Number,
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
    },
    tdsTax: {
        value: {
            type: Number,
            default: 0,
        },
        status: {
            type: Boolean,
            default: false,
        }
    },
    gstTax: {
        value: {
            type: Number,
            default: 0,
        },
        status: {
            type: Boolean,
            default: false,
        }
    },
    insurance: {
        value: {
            type: Number,
            default: 0,
        },
        status: {
            type: Boolean,
            default: false,
        }
    },
}, {
    timestamps: true
});


// userSchema.pre('save', function (next) {
//     if (this.interestRate && this.loanAmount) {
//         this.payableInterest = (this.interestRate / 100) * this.loanAmount;
//         const monthlyInterestRate = (this.interestRate / 100) / 12;
//         const tenureYears = parseInt(this.tenure.match(/\d+/)[0]);
//         const tenureMonths = tenureYears * 12;
//         this.emi = (this.loanAmount * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths))) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
//     }
//     next();
// });

userSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    const { interestRate, loanAmount, tenure } = update;

    if (loanAmount && interestRate && tenure) {
        // total tenure months
        const tenureYears = parseInt(tenure.match(/\d+/)[0]);
        const tenureMonths = tenureYears * 12;

        // monthly intrest
        const monthlyInterestRate = interestRate / 1200;

        console.log(parseFloat(loanAmount));
        console.log((Math.pow(1 + monthlyInterestRate, tenureMonths)));

        let updatedEMi = (parseFloat(loanAmount) * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths))) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
        // emi
        update.emi = parseInt(updatedEMi, 10);

        const totalAmountToBePaid = updatedEMi * tenureMonths;
        const interestToBePaid = totalAmountToBePaid - parseFloat(loanAmount);
        update.payableInterest = Math.ceil(interestToBePaid);
    }
    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;