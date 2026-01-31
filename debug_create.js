require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

// Mock User ID - usually invalid unless we fetch a real one, but unique index error happens BEFORE auth check in mongo? 
// No, auth check is in controller. But model validation happens on save.
// I need a valid user ID. I'll pick the first user found.
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected");

        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            process.exit();
        }

        try {
            console.log("Attempting to create topic 'A'...");
            await Topic.create({
                title: "A",
                description: "A",
                createdBy: user._id
            });
            console.log("Success!");
        } catch (err) {
            console.log("CAUGHT ERROR FULL:");
            console.log(err);
            if (err.code === 11000) {
                console.log("Duplicate Key:", err.keyValue);
            }
        }

        console.log("--- Indexes ---");
        console.log(JSON.stringify(await Topic.collection.getIndexes(), null, 2));

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
