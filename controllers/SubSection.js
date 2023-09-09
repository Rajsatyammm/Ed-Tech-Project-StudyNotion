const Section = require('../models/Section')
const SubSection = require('../models/SubSection')
const uploadToCloudinary = require('../utils/Uploader')
require('dotenv').config()


// create subsection
exports.createSubSection = async (req, res) => {
    try {

        // fetch data from req body
        const { title, timeDuration, description, sectionId } = req.body

        // fetch video from req files
        const { video } = req.files.video

        // validate
        if (!title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: 'Fill all the details',
            })
        }

        // update video to cloudinary
        const uploadDetails = await uploadToCloudinary(video, process.env.CLOUDINARY_FOLDER_NAME)

        // create subsection
        const subsection = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url
        })

        // add the subsection id to section schema
        const updatedData = await SubSection.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: subsection._id } },
            { new: true }
        )
            .populate('subSection')
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: 'Subsection created successfully'
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: ' error occured while creating Subsection'
        })
    }
}

//update subsection


// delete subsection