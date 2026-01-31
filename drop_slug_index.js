require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            await Topic.collection.dropIndex('slug_1');
            console.log("Dropped slug_1 index SUCCESS");
        } catch (e) {
            console.log("slug_1 index drop failed or not found:", e.message);
        }

        const indexes = await Topic.collection.getIndexes();
        console.log('Remaining Indexes:', JSON.stringify(indexes));

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
