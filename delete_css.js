require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        const topic = await Topic.findOne({ route: 'css' });
        console.log('Found by route "css":', topic);

        if (topic) {
            const res = await Topic.deleteOne({ _id: topic._id });
            console.log('Deleted:', res);
        } else {
            console.log("No topic found with route 'css'");
            // Check all topics to see if any conflict
            const all = await Topic.find({}, 'title route');
            console.log('All topics:', all);
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
