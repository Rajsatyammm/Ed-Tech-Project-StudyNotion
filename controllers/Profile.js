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
exports.deleteProfile = async (req, res) => {
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