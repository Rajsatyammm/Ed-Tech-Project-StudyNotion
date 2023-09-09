const Section = require('../models/Section')
const Course = require('../models/Course')


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
            message: 'unable to create section'
        })
    }
}


// update section
exports.updateSection = async (req, res) => {
    try {

        // fetch data from req body
        const { sectionName, sectionId } = req.body

        // validate
        if (!sectionId || !sectionName) {
            return res.status(401).json({
                success: false,
                message: 'plz fill all the details'
            })
        }

        // update
        const updatedData = await Section.findByIdAndUpdate(sectionId, { sectionName: sectionName }, { new: true })

        // return response
        return res.status(200).json({
            success: true,
            message: 'section updated successfully'
        })

    } catch (e) {

        return res.status(500).json({
            success: false,
            message: 'error occured while updating section'
        })
    }
}


// delete section
exports.deleteSection = async (req, res) => {
    try {

        // fetch data from req params
        // assuming that we are sending ID in params
        const { sectionId } = req.params;

        // validate
        if (!sectionId) {
            return res.status().json({
                success: false,
                message: 'Please enter all the details'
            })
        }

        // TODO : do we need to delete the entry from the course schema
        
        // remove from course schema
        // const updatedCourseData = await Course.findByIdAndDelete(
        //     {courseContent: sectionId},
        //     {$pull, {}}
        //     )

        // delete the section
        await Section.findByIdAndDelete({ sectionId: sectionId })

        // return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
        })

    } catch (e) {

        return res.status(500).json({
            success: true,
            message: 'error occured while updating section',
        })
    }
}