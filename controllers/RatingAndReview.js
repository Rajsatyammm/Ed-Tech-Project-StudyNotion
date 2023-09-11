const User = require('../models/User')
const RatingAndReview = require('../models/RatingAndReview')
const Course = require('../models/Course')

// create rating
exports.createRating = async (req, res) => {
    try {

        // fetch data from req body
        const { rating, review, courseId } = req.body;

        // fetch id 
        const { id } = req.user

        // validation
        if (!rating || !review) {
            return res.json({
                success: false,
                message: 'all fields are required'
            })
        }

        if (rating > 5 || rating <= 0) {
            return res.json({
                success: false,
                message: 'rating must be between 0 and 5',
            })
        }

        // check user is enrolled in the course
        const enrolledData = await Course.findOne({
            _id: id,
            studentsEnrolled: { $elemMatch: { $eq: id } }
        })

        if (!enrolledData) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in this course',
            })
        }

        // check user has already reviewed the course
        const alreadyReview = await RatingAndReview.findOne({
            _id: id,
            course: courseId,
        })

        // update the rating
        if (alreadyReview) {

            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
                updatedRating,
            })

        }

        // create and insert in rating schema
        const ratingsData = await RatingAndReview.create({
            user: id,
            rating: rating,
            review: review,
            course: courseId,
        })

        // insert in Course schema
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { ratingAndReviews: ratingsData._id } }
        )

        return res.status(200).json({
            success: true,
            message: 'rating created successfully',
            ratingsData,
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'error occured while creating rating'
        })
    }
}


// Get the average rating for a course
exports.getAverageRating = async (req, res) => {
    try {
        const { courseId } = req.body

        // Calculate the average rating using the MongoDB aggregation pipeline
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId), // Convert courseId to ObjectId
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                },
            },
        ])

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        // If no ratings are found, return 0 as the default rating
        return res.status(200).json({
            success: true,
            averageRating: 0,
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve the rating for the course",
            error: error.message,
        })
    }
}

// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
    try {

        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
            })
            .populate({
                path: "course",
                select: "courseName", //Specify the fields you want to populate from the "Course" model
            })
            .exec()

        res.status(200).json({
            success: true,
            data: allReviews,
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve the rating and review for the course",
            error: error.message,
        })
    }
}