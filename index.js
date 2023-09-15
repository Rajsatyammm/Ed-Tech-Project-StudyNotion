const express = require('express')
const app = express()
const userRoute = require('./routes/User')
// const paymentRoute = require('./routes/Payments')
const profileRoute = require('./routes/Profile')
const courseRoute = require('./routes/Course')

const cookieParser = require('cookie-parser')
const cors = require('cors')
const { cloudinaryConnect } = require('./config/cloudinary')
const dbConnection = require('./config/database')
const fileUpload = require('express-fileupload')

require('dotenv').config()

const PORT = process.env.PORT || 4000

// database connection
dbConnection()

// cloudinary connection
cloudinaryConnect()

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
)

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp',
    })
)

// route
app.use('/api/v1/user', userRoute)
app.use('/api/v1/profile', profileRoute)
app.use('/api/v1/course', courseRoute)
// app.use('api/v1/payment', paymentRoute)

// default route
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: 'server is running'
    })
})



app.listen(process.env.PORT, () => {

    console.log(`Server started at ${process.env.PORT}`)
})
