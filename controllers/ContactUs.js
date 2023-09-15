const mailSender = require('../utils/mailSender')
const { contactUsEmail } = require('../mail/template/contactFormRes')

exports.contactUsController = async (req, res) => {

    // fetch data from req body
    const { email, firstname, lastname, message, phoneNo } = req.body

    // console.log(req.body)
    try {

        const emailRes = await mailSender(
            email,
            "Your Data send successfully",
            contactUsEmail(email, firstname, lastname, message, phoneNo)
        )

        // console.log("Email Res ", emailRes)

        return res.json({
            success: true,
            message: "Email send successfully",
        })

    } catch (error) {
        console.log("Error", error)
        console.log("Error message :", error.message)
        return res.json({
            success: false,
            message: "Something went wrong...",
        })
    }
}
