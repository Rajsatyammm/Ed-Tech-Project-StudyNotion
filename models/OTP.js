const mongoose = require('mongoose')
const mailSender = require('../utils/mailSender')


const OTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expiresIn: 5*60,
        },
        
    }
)

async function sendVerificationEmail(email, otp) {
    try {

        const mailResponse = await mailSender(email, "Verification Email from rajsatyammm", otp)
        console.log('Email send Successfully', mailResponse)
    } catch(e) {
        console.log('error occured while sending mail', e)
        throw error
    }
}

OTPSchema.pre('save', async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next()
})

module.exports = mongoose.model("OTP", OTPSchema)