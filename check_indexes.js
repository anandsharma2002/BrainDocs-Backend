require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        const indexes = await Topic.collection.getIndexes();
        console.log('Indexes:', JSON.stringify(indexes)); // Single line
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
