const Course = require('../models/Course')
const User = require('../models/User')
const Tag = require('../models/Tag')
require('dotenv').config()
const uploadImageToCloudinary = require('../utils/imageUploader')



exports.createCourse = async (req, res) => {
    try {
        // fetch data from req body
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
        } = req.body;

        // fetch thumbnail
        const { thumbnail } = req.files.image;

        // validate the data
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag) {
            return res.status().json({
                success: false,
                message: 'Please fill all the entry of tags'
            })
        }

        // check for instructor
        const { userId } = req.body;
        const instructorDetails = await User.findById(userId)

        if (!instructorDetails) {
            return res.status().json({
                success: false,
                message: 'Instructor details not found'
            })
        }

        // validate tag
        const tagDetails = await Tag.findById(tag)
        if (!tagDetails) {
            return res.status().json({
                success: false,
                message: 'Tag details not found'
            })
        }


        // insert to database
        const savedData = Course.create({})

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.CLOUDINARY_FOLDER_NAME)

        // create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            thumbnail: thumbnailImage.secure_url,
            tag: tagDetails._id,
        })

        // add the new course to the user schema of instructor
        const updatedCourseData = await User.findAndUpdate(
            { id: instructorDetails._id },
            { $push: { courses: newCourse._id, } },
            { new: true },
        )

        // update the tag schema by putting the new courses in the specific tag 
        const updatedTagData = await Tag.findOneAndUpdate(
            { name: tag },
            { $push: { courses: newCourse._id } },
            { new: true }
        )

        return res.json(200).json({
            success: true,
            message: 'Course Created Successfully'
        })


    } catch (e) {

        return res.json(400).json({
            success: false,
            message: 'Error occured while creating course'
        })
    }
}


exports.showAllCourses = async (req, res) => {
    try {

        const allCourses = await Course.find({},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                courseContent: true,
                studentsEnrolled: true,
            }
        ).populate('instructor').exec()

        return res.status(200).json({
            success: true,
            message: 'Data for the courses fetched successfully',
            allCourses,
        })

    } catch (e) {
         
        return res.json(400).json({
            success: false,
            message: 'Error occured while fetching the course data'
        })
    }
}