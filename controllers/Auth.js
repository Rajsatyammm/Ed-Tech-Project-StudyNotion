const User = require('../models/User')
const Profile = require('../models/Profile')
const OTP = require('../models/OTP')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


// send OTP

exports.sendOTP = async (req, res) => {
    try {

        // fetch email from req body
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'email not found'
            })
        }

        // check user is already present 
        const checkUserPresent = await User.find({ email })
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            })
        }

        //generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log("OTP Generator : ", otp)

        //cheak the uniqueness of OTP
        const OTPResult = await OTP.findOne({ otp: otp })

        while (OTPResult) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })

            OTPResult = await OTP.findOne({ otp: otp })
        }

        // create an otp
        const otpPayload = new OTP({ email: email, otp: otp })
        const otpBody = otpPayload.save()
        console.log(otpBody)

        //return response successfull
        res.status(200).json({
            success: true,
            message: 'OTP sent Successfully',
            otp: otp,
        })

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message
        })
    }
}


// signup

exports.signUp = async (req, res) => {
    try {

        // fetch data from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;


        // validate
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required',
            })
        }

        // check password and confirm password
        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: `Password and Confirm password doesn't match, please try again`,
            })
        }

        // check user already present or not
        const checkUserPresent = await User.findOne({ email })
        if (checkUserPresent) {
            return res.status().json({
                success: false,
                message: 'User is already Registerd',
            })
        }

        // find most recent OTP
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)

        // validate OTP
        if (recentOTP.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            })
        }
        else if (otp != recentOTP.otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            })
        }

        // Hash Password
        const HashedPassword = await bcrypt.hash(password, 10);

        // create entry in DB

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: HashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api/dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: 'User is registerd successfully',
        })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: true,
            message: `User can't be registerd`,
        })
    }
}


// login

exports.login = async (req, res) => {

    try {
        // fetch data from req body
        const { email, password } = req.body;

        // check entry null
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        // check email is present is database
        const user = await User.findOne({ email }).populate("additionalDetails").exec()

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not registered',
            })
        }

        // check password is same or not
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            })

            user.token = token
            user.password = undefined


            // create cookie
            const options = {
                expires: new Date(Date.now() + 3 * 60 * 60 * 24 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in Successfully',
            })


        }
        else {

            return res.status(401).json({
                success: false,
                message: 'Password is Incorrect',
            })
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'login Failure please try again',
        })
    }
}



//change password

exports.changePassword = async (req, res) => {
    try {
        // fetch data from req.body
        const { password, newPassword, newConfirmPassword, token } = req.body;

        // token not present
        if(!token) {
            return res.status(404).json({
                success: false,
                message: 'token not found',
            })
        }

        // both new password not matched
        if (newPassword !== newConfirmPassword) {
            return res.status().json({
                success: false,
                message: 'New passwords does not match',
            })
        }



        //password update in db
        // send mail password changed
        //return response

    } catch (e) {

    }


}

