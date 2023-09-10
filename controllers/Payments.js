const { instance } = require('../config/razorpay')
const Course = require('../models/Course')
const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const { courseEnrollmentEmail } = require('../mail/template/courseEnrollmentEmail')
const mongoose = require('mongoose')


// capture the payment and razorpay order
exports.capturePayment = async (req, res) => {

    // fetch data 
    const { course_id } = req.body
    const userId = req.user.id

    // validation
    if (!course_id || !userId) {
        return res.json(400).json({
            success: false,
            message: 'all details not found while capturing payment',
        })
    }

    // valid Course Id
    let course
    try {

        course = await Course.findById(course_id)
        if (!course) {
            return res.json(400).json({
                success: false,
                message: 'Course does not found through tha given id',
            })
        }

        // user already paid for the course
        const uId = new mongoose.Types.ObjectId(userId)
        if (course.studentsEnrolled.includes(uId)) {
            return res.status(200).json({
                success: false,
                message: `Course has already been purchased by the user ${uId.firstName} + ${uId.lastName}`
            })
        }


    } catch (e) {
        console.error(e)
        return res.status(500).json({
            success: false,
            message: e.message,
        })
    }

    // order create
    const amount = course.price
    const currency = "INR"

    const options = {
        amount: amount * 100,
        currency,
        reciept: Math.random(Date.now()).toString(),
        notes: {
            course_id,
            userId,
        }
    }

    try {
        // initiate the payment
        const paymentResponse = await instance.orders.orders(options)
        console.log(paymentResponse)

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })


    } catch (e) {
        console.error(e)
        return res.json({
            success: false,
            message: 'Could not initialte message'
        })
    }
}


// Verify signature of razorpay
exports.verifySignature = async (req, res) => {
    try {

        const webhookSecret = '123456'
        const signature = req.headers['x-razorpay-signature']

        const shasum = crypto.createHmac('sha256', webhookSecret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')

        if (signature === digest) {
            console.log('payment is authorised')

            // fetch course id and user id
            const { course_id, userId } = req.body.payload.payment.entity.notes

            try {

                // find the user and enroll the student
                const updatedUser = await User.findByIdAndUpdate(userId,
                    { $push: { courses: course_id } }, { new: true }
                )

                if (!updatedUser) {
                    return res.json({
                        success: false,
                        message: 'User not found'
                    })
                }

                // find the course and enroll the student
                const updatedCourse = await Course.findByIdAndUpdate(course_id,
                    { $push: { studentsEnrolled: userId } }, { new: true }
                )

                if (!updatedCourse) {
                    return res.json({
                        success: false,
                        message: 'User not found'
                    })
                }

                // send confirmation mail to user
                const emailResponse = await mailSender(
                    updatedUser.email,
                    "Congratulation from Raj",
                    `Congratulation, You have Successdully Enrolled the course: ${updatedCourse.courseName}`,
                )

                console.log(emailResponse)
                return res.status(200).json({
                    success: true,
                    message: 'Course enrolled successfully'
                })

            } catch (e) {
                console.error(e)
                return res.status(500).json({
                    success: false,
                    message: e.message
                })
            }
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid request'
        })

    } catch (e) {

    }
}
