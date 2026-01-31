
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const listTopics = async () => {
    await connectDB();
    const topics = await Topic.find({});
    console.log('Existing Topics:');
    topics.forEach(t => console.log(`- ${t.title} (slug: ${t.route})`));
    process.exit();
};

listTopics();
