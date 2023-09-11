const mailSender = require('../utils/mailSender')

exports.contactUs = async (req, res) => {
    try {

        // fetch data from req body
        const { firstName, lastName, email, message, phoneNo } = req.body

        // validate 
        if (!firstName || !lastName || !email || !message || !phoneNo) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required to fill',
            })
        }

        // send mail to myself
        const mail = await mailSender(process.env.MY_EMAIL,
            `Email recieved from ${email}`,
            message
        )

        // send mail to user
        const mailData = await mailSender(email,
            "Email from Raj",
            "We have recieved your mail and will contact to you ASAP"
        )

        return res.status(200).json({
            success: true,
            message: 'Successfully sent response to the user',
        })


    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'error occured while sending mail form the contact us data',
        })
    }
}
