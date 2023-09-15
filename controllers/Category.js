const Category = require('../models/Category')

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// create category
exports.createCategory = async (req, res) => {

    try {
        // fetch data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the entry of tags'
            })
        }

        // check category is already created or not
        const isAlreadyPresent = await Category.findOne({ name: name })
        if (isAlreadyPresent) {
            return res.status(400).json({
                success: false,
                message: 'Category already present'
            })
        }

        // Entry to database
        const category = new Category({
            name,
            description,
        })
        const response = await category.save()
        console.log(response)

        // send response
        return res.status(200).json({
            success: true,
            message: 'Category created successfully'
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while creating a category',
            error: e.message,
        })
    }
}

// showAllCategory
exports.showAllCategories = async (req, res) => {
    try {
        // find data from DB
        const allCategories = await Category.find()

        // send response
        res.status(200).json({
            success: true,
            message: 'All category fetched successfully',
            allCategory: allCategories,
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error occured while showing Category',
            error: e.message,
        })
    }
}

// categorypageDetails
exports.categoryPageDetails = async (req, res) => {
    try {

        // get category id
        const { categoryId } = req.body

        // get courses for specified category Id
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: 'courses',
                match: { status: "Published" },
                populate: 'ratingAndReviews'
            })
            .exec()

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
            })
        }

        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // get course for different catgories
        const categoriesExceptSelected = await Category.find(
            { _id: { $ne: categoryId } }
        )
            .populate('courses')
            .exec()

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()

        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()

        const allCourses = allCategories.flatMap((category) => category.courses)

        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}