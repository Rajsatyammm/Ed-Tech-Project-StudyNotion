const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')


// auth

exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token ||
            req.body.token ||
            req.header("Authorisation").replace("Bearer ", "")

        // if token missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'token Missing',
            })
        }

        // token verify
        try {

            const decode = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode

        } catch (e) {
            return res.status(401).json({
                success: false,
                message: 'token is invalid'
            })
        }

        next()


    } catch (e) {
        return res.status(401).json({
            success: 'false',
            message: 'Sonething went wrong while validating the token'
        })
    }
}


// isStudent

exports.isStudent = async (req, res, next) => {

    try {

        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for students only',
            })
        }
        next()

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'User role can not be verified',
        })
    }
}


//isInstructor

exports.isInstructor = async (req, res, next) => {

    try {

        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Instructor only',
            })
        }
        next()

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'User role can not be verified',
        })
    }
}


//isInstructor

exports.isInstructor = async (req, res, next) => {

    try {

        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Instructor only',
            })
        }
        next()

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'User role can not be verified',
        })
    }
}


//isAdmin

exports.isAdmin = async (req, res, next) => {

    try {

        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Admin only',
            })
        }
        next()

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'User role can not be verified',
        })
    }
}