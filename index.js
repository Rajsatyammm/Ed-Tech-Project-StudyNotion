const express = require('express')
require('dotenv').config()
const router = require('./routes/route') 


const app = express()

app.use(express.json())

app.use('/', router)



app.listen(process.env.PORT, () => {

    console.log(`Server started at ${process.env.PORT}`)
})
