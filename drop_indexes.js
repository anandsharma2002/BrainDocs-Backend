require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            await Topic.collection.dropIndex('route_1');
            console.log("Dropped route_1 index");
        } catch (e) { console.log("route_1 index not found or error", e.message); }

        try {
            await Topic.collection.dropIndex('title_1');
            console.log("Dropped title_1 index");
        } catch (e) { console.log("title_1 index not found or error", e.message); }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
