const nodemailer = require("nodemailer");
const pug = require("pug");
require("dotenv").config();

module.exports = class Email {
    constructor(userName, userEmail, userPhn, url, applicationID, loanAmount, loanType, tenure) {
        this.name = userName;
        this.to = userEmail;
        this.userPhn = userPhn,
            this.url = url;
        this.applicationID = applicationID;
        this.loanAmount = loanAmount;
        this.loanType = loanType;
        this.tenure = tenure;
        this.from = `Micro Finance India <microfinanceloansindia@gmail.com>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === "production") {
            console.log("Prod");
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        // 1) Render HTML based on a pug template
        console.log(`${__dirname}/../view/${template}.pug`);
        const html = pug.renderFile(`${__dirname}/../view/${template}.pug`, {
            firstName: this.name,
            url: this.url,
            subject,
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            // text: htmlToText.fromString(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async booking(template, sub) {

        let mailList = ["info@evchargingstationindia.com"];
        mailList.push(this.to);
        console.log(mailList);

        console.log(`${__dirname}/../view/${template}.pug`);
        const html = pug.renderFile(`${__dirname}/../view/${template}.pug`, {
            firstName: this.name,
            url: this.url,
            subject: sub,
            applicationID: this.applicationID,
            loanAmount: this.loanAmount,
            loanType: this.loanType,
            tenure: this.tenure
        });

        const mailOptions = {
            from: this.from,
            bcc: mailList,
            subject: sub,
            html,
        };

        await this.newTransport().sendMail(mailOptions);
    }

    // for staff
    async sendPasswordReset() {
        await this.send(
            "passwordReset",
            "Your password reset token (valid for only 10 minutes)"
        );
    }

    // for creating loan request
    async sendBookingInfo() {
        await this.booking(
            "booking",
            "We have received your Loan Application"
        );
    }


};