const Tag = require('../models/Tag')

exports.createTag = async (req, res) => {

    try {
        // fetch data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status().json({
                success: false,
                message: 'Please fill all the entry of tags'
            })
        }

        // Entry to database
        const tag = new Tag({ name, description })
        const response = await tag.save()

        // send response
        return res.status().json({
            success: true,
            message: 'Tag created successfully'
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while creating a tag'
        })
    }
}


exports.showAllTags = async (req, res) => {
    try {
        // find data from DB
        const allTags = Tag.find({}, { name: true, description: true })

        // send response
        res.status(200).json({
            success: true,
            message: 'All tags fetched successfully',
            allTags: allTags,
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while showing tag'
        })
    }
}