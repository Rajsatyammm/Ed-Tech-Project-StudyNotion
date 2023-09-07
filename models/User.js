const mongoose = require('mongoose')


const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            require: true,
            trim: true,
        },
        lastName: {
            type: String,
            require: true,
            trim: true,
        },
        email: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            require: true,
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            require: true,
        },
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }],
        token: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        image: {
            type: String,
            required: true,

        },
        courseProgress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        }
    }
)


module.exports = mongoose.model("User", userSchema)