const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const bcrypt = require('bcrypt')

// reset password token

exports.resetPasswordToken = async (req, res) => {

    try {
        // fetch data from request body
        const { email } = req.body;

        // check user by using this email
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({
                success: false,
                message: 'Email is not registered'
            })
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by providing the token and expireation time
        const updatedUserData = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        )

        // create url
        const url = `http://localhost:3000/update-password/${token}`

        // send mail containing the url
        await mailSender(
            email,
            "Password Reset Link",
            `Password reset link: ${url}`
        )

        // return response
        return res.status(200).json({
            success: true,
            message: 'Email sent successfully, please check email'
        })

    } catch (e) {
        console.log(e)
        return res.status(400).json({
            success: false,
            message: 'something went wrong while resetting password'
        })
    }
}


// reset password

exports.resetPassword = async (req, res) => {

    try {
        // fetch data from req body
        const { password, confirmPassword, token } = req.body;

        // validate both the password
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password not matching'
            })
        }

        // fetch user details from db using token
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.json({
                success: false,
                message: 'No user Exists, token Invalid'
            })
        }

        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'token is Expired please regenerate your token'
            })
        }

        // hash password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (e) {
            console.log(e)
            return res.json({
                success: false,
                message: 'Error occured while hashing the password',
            })
        }

        // update password in db
        const updatedUserData = await User.findOneAndUpdate(
            { token },
            { password: hashedPassword },
            { new: true }
        )

        // send mail
        await mailSender(updatedUserData.email,
            "Password reset Successfully",
            `Your password has successfully been reset, 
             login again with the new password`,
        )

        // return response
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        })


    } catch (e) {
        return res.json({
            success: false,
            message: 'error occured while resetting the password',
        })
    }
}
