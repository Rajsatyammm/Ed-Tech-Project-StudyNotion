const Profile = require('../models/Profile')
const User = require('../models/User')
const Course = require('../models/Course')


exports.updateProfile = async (req, res) => {
    try {

        // fetch data from req body
        const { gender, dateOfBirth = "", about = "", contactNumber } = req.body

        // get user id
        const userId = req.user.id

        // validation
        if (!gender || !contactNumber || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details'
            })
        }

        // find profile
        const userDetails = await User.findById(userId)
        const profileId = userDetails.profileDetails
        const profileDetails = await Profile.findById(profileId)

        // update profile
        profileDetails.gender = gender
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.contactNumber = contactNumber

        await profileDetails.save()

        // return response
        return res.status(200).json({
            success: true,
            message: 'profile updated successfully',
            profileDetails: profileDetails,
        })


    } catch (e) {

        return res.status(400).json({
            success: false,
            message: 'error occured while updating profile',
        })
    }
}


// delete account
exports.deleteAccount = async (req, res) => {
    try {

        // get id
        const userId = req.user.id

        // validation of id
        if (!userId) {
            return res.json({
                success: false,
                mesage: 'please enter user id'
            })
        }

        const userData = await User.findById(userId)

        if (!data) {
            return res.status(400).json({
                success: false,
                message: `User not found`,
            })
        }

        // delete profile
        await Profile.findByIdAndDelete({ _id: userData.additionalDetails })

        // TODO: unenroll from all the courses of the particular student

        // const courseData = userData.courses
        // courseData.map(async (courseId) => {
        //     await Course.findByIdAndRemove(
        //         { courseId },
        //         { $pull: { studentsEnrolled: userData._id } },
        //         { new: true }
        //     )
        // })

        // await User.findByIdAndDelete({courses: })

        // user delete
        await User.findByIdAndDelete({ _id: userId })

        // return response
        return res.status(200).json({
            success: true,
            message: 'User deleted Successfully'
        })

    } catch (e) {
        return res.json({
            success: false,
            message: 'error occured while deleting the profile'
        })
    }
}


// getalluserdetails
exports.getAllUserDetails = async (req, res) => {
    try {

        // fetch user id
        const userId = req.user.id

        // get user details
        const userDetails = await User.findById(userId)
            .populate('additionalDetails')
            .exec()

        // return res
        return res.status(200).json({
            success: true,
            message: 'User data fetched successfully'
        })


    } catch (e) {
        return res.status(500).json({
            success: true,
            message: 'error occured while getting all the user details'
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
            _id: userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()
        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id })

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnroled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        })

        res.status(200).json({ courses: courseData })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}