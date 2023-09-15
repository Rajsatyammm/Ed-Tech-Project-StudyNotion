const Section = require('../models/Section')
const Course = require('../models/Course')
const SubSection = require('../models/SubSection')

// create section
exports.createSection = async (req, res) => {
    try {

        // fetch data from req body
        const { sectionName, courseId } = req.body;

        // validation
        if (!sectionName) {
            return res.status(401).json({
                success: false,
                message: 'Please fill all the details'
            })
        }

        // create section
        const newSection = await Section.create({ sectionName })

        // update the course with section onject 
        const updatedCourse = await Course.findByIdAndUpdate(
            { _id: courseId },
            { $push: { courseContent: newSection._id } },
            { new: true }
        )
        // HW:  use populate such that we can populate section and subsection at a time

        // return response
        return res.status(200).json({
            success: true,
            message: 'Section created successfully'
        })


    } catch (e) {

        return res.status(500).json({
            success: false,
            message: 'unable to create section',
            error: e.message,
        })
    }
}


// update section
exports.updateSection = async (req, res) => {
    try {

        // fetch data from req body
        const { sectionName, sectionId, courseId } = req.body

        // validate
        if (!sectionId || !sectionName) {
            return res.status(401).json({
                success: false,
                message: 'plz fill all the details'
            })
        }

        // update
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName: sectionName },
            { new: true }
        )

        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: section,
            data: course,
        })

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: 'error occured while updating section',
            error: e.message,
        })
    }
}


// delete section
exports.deleteSection = async (req, res) => {
    try {

        // fetch data from req body
        const { sectionId, courseId } = req.body;

        // validate
        if (!sectionId) {
            return res.status().json({
                success: false,
                message: 'Please enter all the details'
            })
        }

        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        })

        const section = await Section.findById(sectionId)
        console.log(sectionId, courseId)
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            })
        }

        // Delete the associated subsections
        await SubSection.deleteMany({ _id: { $in: section.subSection } })

        await Section.findByIdAndDelete(sectionId)

        // find the updated course and return it
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            data: course,
        })

    } catch (e) {

        return res.status(500).json({
            success: true,
            message: 'error occured while updating section',
            error: e.message,
        })
    }
}