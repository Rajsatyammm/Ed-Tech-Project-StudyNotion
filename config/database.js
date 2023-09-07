const mongoose = require('mongoose')

require('dotenv').config()

const dbConnection = async () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useUnifiedTopology: true,
    })
        .then(() => console.log('Connection to DataBase Success'))
        .catch((e) => {
            console.log('Connection not Established', e)
            process.exit(1)
        })

}

module.exports = dbConnection;