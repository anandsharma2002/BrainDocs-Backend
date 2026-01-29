const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@braindocs.com';
        const password = 'admin123';

        // We can't use findOneAndUpdate with pre-save hooks (hashing) easily unless we hash manually
        // But User.create uses hooks.
        // Let's first DELETE the user to ensure clean state.

        await User.deleteOne({ email });
        console.log('Existing admin deleted (if any)');

        const superAdmin = await User.create({
            name: 'Super Admin',
            email,
            password,
            role: 'SuperAdmin',
            bio: 'System Administrator'
        });

        console.log('SUCCESS: Admin created newly');
        console.log('Email:', superAdmin.email);
        console.log('Password:', 'admin123');

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

resetAdmin();
