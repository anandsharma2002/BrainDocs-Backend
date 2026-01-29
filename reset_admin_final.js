const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

console.log('Script started...');

const run = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@braindocs.com';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        console.log('Upserting user...');
        const user = await User.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    name: 'Super Admin',
                    email: email,
                    password: hashedPassword,
                    role: 'SuperAdmin',
                    avatar: `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=Super+Admin`
                }
            },
            { upsert: true, new: true, runValidators: false }
        );

        console.log('SUCCESS: User upserted.');
        console.log('ID:', user._id);
        console.log('Email:', user.email);

        process.exit(0);
    } catch (err) {
        console.error('FATAL ERROR:', err);
        process.exit(1);
    }
};

run();
