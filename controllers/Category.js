const Category = require('../models/Category')

exports.createCategory = async (req, res) => {

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
        const category = new Category({ name, description })
        const response = await category.save()

        // send response
        return res.status().json({
            success: true,
            message: 'Category created successfully'
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while creating a category'
        })
    }
}


exports.showAllCategories = async (req, res) => {
    try {
        // find data from DB
        const allCategories = Category.find({}, { name: true, description: true })

        // send response
        res.status(200).json({
            success: true,
            message: 'All category fetched successfully',
            allCategory: allCategories,
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while showing Category'
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {

        // get category id
        const { categoryId } = req.body

        // get courses for specified category Id
        const selectedCategory = await Category.findById(categoryId)
            .populate('courses')
            .exec()

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
            })
        }

        // get course for different catgories
        const differentCategories = await Category.find(
            { _id: { $ne: categoryId } }
        )
            .populate('courses')
            .exec()

        // get top 10 selling courses
        // complete krna hai


        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories
            }
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        })
    }
}